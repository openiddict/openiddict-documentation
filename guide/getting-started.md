# Getting started

**To implement a custom OpenID Connect server using OpenIddict, the simplest option is to clone one of the official samples** from the [openiddict-samples repository](https://github.com/openiddict/openiddict-samples).

If you don't want to start from one of the recommended samples, you'll need to:

  - **Install the [.NET Core 2.1.x, 3.1.x or .NET 5.0.x tooling](https://www.microsoft.com/net/download)**.

  - **Have an existing project or create a new one**: when creating a new project using Visual Studio's default ASP.NET Core template,
  using **individual user accounts authentication** is strongly recommended as it automatically includes the default ASP.NET Core Identity UI, based on Razor Pages.

  - **Update your `.csproj` file** to reference the `OpenIddict` packages:

    ```xml
    <PackageReference Include="OpenIddict.AspNetCore" Version="3.0.0" />
    <PackageReference Include="OpenIddict.EntityFrameworkCore" Version="3.0.0" />
    ```

  - **Configure the OpenIddict core, server and validation services** in `Startup.ConfigureServices`.
    Here's an example for the client credentials grant, used in machine-to-machine scenarios:

    ```csharp
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddControllersWithViews();

        services.AddDbContext<ApplicationDbContext>(options =>
        {
            // Configure the context to use Microsoft SQL Server.
            options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection"));

            // Register the entity sets needed by OpenIddict.
            // Note: use the generic overload if you need
            // to replace the default OpenIddict entities.
            options.UseOpenIddict();
        });

        services.AddOpenIddict()

            // Register the OpenIddict core components.
            .AddCore(options =>
            {
                // Configure OpenIddict to use the Entity Framework Core stores and models.
                // Note: call ReplaceDefaultEntities() to replace the default entities.
                options.UseEntityFrameworkCore()
                       .UseDbContext<ApplicationDbContext>();
            })

            // Register the OpenIddict server components.
            .AddServer(options =>
            {
                // Enable the token endpoint.
                options.SetTokenEndpointUris("/connect/token");

                // Enable the client credentials flow.
                options.AllowClientCredentialsFlow();

                // Register the signing and encryption credentials.
                options.AddDevelopmentEncryptionCertificate()
                      .AddDevelopmentSigningCertificate();

                // Register the ASP.NET Core host and configure the ASP.NET Core options.
                options.UseAspNetCore()
                      .EnableTokenEndpointPassthrough();
            })

            // Register the OpenIddict validation components.
            .AddValidation(options =>
            {
                // Import the configuration from the local OpenIddict server instance.
                options.UseLocalServer();

                // Register the ASP.NET Core host.
                options.UseAspNetCore();
            });

        // Register the worker responsible of seeding the database with the sample clients.
        // Note: in a real world application, this step should be part of a setup script.
        services.AddHostedService<Worker>();
    }
    ```

  - **Make sure the ASP.NET Core authentication middleware is correctly registered at the right place**:

    ```csharp
    public void Configure(IApplicationBuilder app)
    {
        app.UseDeveloperExceptionPage();

        app.UseRouting();

        app.UseAuthentication();
        app.UseAuthorization();

        app.UseEndpoints(options =>
        {
            options.MapControllers();
            options.MapDefaultControllerRoute();
        });

        app.UseWelcomePage();
    }
    ```

  - **Update your Entity Framework Core context registration to register the OpenIddict entities**:

    ```csharp
    services.AddDbContext<ApplicationDbContext>(options =>
    {
        // Configure the context to use Microsoft SQL Server.
        options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection"));

        // Register the entity sets needed by OpenIddict.
        // Note: use the generic overload if you need
        // to replace the default OpenIddict entities.
        options.UseOpenIddict();
    });
    ```

    > [!WARNING]
    > Important: if you change the default entity primary key (e.g. to `int` or `Guid` instead of `string`), make sure you use the `options.ReplaceDefaultEntities<TKey>()`
    > core extension accepting a `TKey` generic argument and use the generic `options.UseOpenIddict<TKey>()` overload to configure EF Core to use the specified type:
    >
    >    ```csharp
    >    services.AddOpenIddict()
    >        .AddCore(options =>
    >        {
    >            // Configure OpenIddict to use the default entities with a custom key type.
    >            options.UseEntityFrameworkCore()
    >                   .UseDbContext<ApplicationDbContext>()
    >                   .ReplaceDefaultEntities<Guid>();
    >        });
    >
    >    services.AddDbContext<ApplicationDbContext>(options =>
    >    {
    >        // Configure the context to use Microsoft SQL Server.
    >        options.UseSqlServer(configuration["Data:DefaultConnection:ConnectionString"]);
    >
    >        options.UseOpenIddict<Guid>();
    >    });
    >```

  - **Create your own authorization controller:**
    Implementing a custom authorization controller is required to allow OpenIddict to create tokens based on the identities and claims you provide.
    Here's an example for the client credentials grant:

    ```csharp
    public class AuthorizationController : Controller
    {
        private readonly IOpenIddictApplicationManager_applicationManager;

        public AuthorizationController(IOpenIddictApplicationManager applicationManager)
            => _applicationManager = applicationManager;

        [HttpPost("~/connect/token"), Produces("application/json")]
        public async Task<IActionResult> Exchange()
        {
            var request = HttpContext.GetOpenIddictServerRequest();
            if (!request.IsClientCredentialsGrantType())
            {
                throw new NotImplementedException("The specified grant is not implemented.");
            }

            // Note: the client credentials are automatically validated by OpenIddict:
            // if client_id or client_secret are invalid, this action won't be invoked.

            var application =
                await _applicationManager.FindByClientIdAsync(request.ClientId) ??
                throw new InvalidOperationException("The application cannot be found.");

            // Create a new ClaimsIdentity containing the claims that
            // will be used to create an id_token, a token or a code.
            var identity = new ClaimsIdentity(
                TokenValidationParameters.DefaultAuthenticationType,
                Claims.Name, Claims.Role);

            // Use the client_id as the subject identifier.
            identity.AddClaim(Claims.Subject,
                await _applicationManager.GetClientIdAsync(application),
                Destinations.AccessToken, Destinations.IdentityToken);

            identity.AddClaim(Claims.Name,
                await _applicationManager.GetDisplayNameAsync(application),
                Destinations.AccessToken, Destinations.IdentityToken);

            return SignIn(new ClaimsPrincipal(identity),
                OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
        }
    }
    ```

  - **Register your client application** (e.g from an `IHostedService` implementation):

    ```csharp
    public class Worker : IHostedService
    {
        private readonly IServiceProvider _serviceProvider;

        public Worker(IServiceProvider serviceProvider)
            => _serviceProvider = serviceProvider;

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            using var scope = _serviceProvider.CreateScope();

            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            await context.Database.EnsureCreatedAsync();

            var manager =
                scope.ServiceProvider.GetRequiredService<IOpenIddictApplicationManager>();

            if (await manager.FindByClientIdAsync("console") is null)
            {
                await manager.CreateAsync(new OpenIddictApplicationDescriptor
                {
                    ClientId = "console",
                    ClientSecret = "388D45FA-B36B-4988-BA59-B187D329C207",
                    DisplayName = "My client application",
                    Permissions =
                    {
                        Permissions.Endpoints.Token,
                        Permissions.GrantTypes.ClientCredentials
                    }
                });
            }
        }

        public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }

    ```