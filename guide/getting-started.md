# Getting started

To use OpenIddict, you need to:

  - **Install the latest [.NET Core 2.x tooling](https://www.microsoft.com/net/download) and update your packages to reference the ASP.NET Core 2.x packages**.

  - **Have an existing project or create a new one**: when creating a new project using Visual Studio's default ASP.NET Core template, using **individual user accounts authentication** is strongly recommended. When updating an existing project, you must provide your own `AccountController` to handle the registration process and the authentication flow.

  - **Add the appropriate MyGet repositories to your NuGet sources**. This can be done by adding a new `NuGet.Config` file at the root of your solution:

    ```xml
    <?xml version="1.0" encoding="utf-8"?>
    <configuration>
    <packageSources>
        <add key="NuGet" value="https://api.nuget.org/v3/index.json" />
        <add key="aspnet-contrib" value="https://www.myget.org/F/aspnet-contrib/api/v3/index.json" />
    </packageSources>
    </configuration>
    ```

  - **Update your `.csproj` file** to reference `AspNet.Security.OAuth.Validation` and the `OpenIddict` packages:

    ```xml
    <PackageReference Include="AspNet.Security.OAuth.Validation" Version="2.0.0-*" />
    <PackageReference Include="OpenIddict" Version="2.0.0-*" />
    <PackageReference Include="OpenIddict.EntityFrameworkCore" Version="2.0.0-*" />
    <PackageReference Include="OpenIddict.Mvc" Version="2.0.0-*" />
    ```

  - **Configure the OpenIddict services** in `Startup.ConfigureServices`:

    ```csharp
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddMvc();

        services.AddDbContext<ApplicationDbContext>(options =>
        {
            // Configure the context to use Microsoft SQL Server.
            options.UseSqlServer(configuration["Data:DefaultConnection:ConnectionString"]);

            // Register the entity sets needed by OpenIddict.
            // Note: use the generic overload if you need
            // to replace the default OpenIddict entities.
            options.UseOpenIddict();
        });

        // Register the Identity services.
        services.AddIdentity<ApplicationUser, IdentityRole>()
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();

        // Register the OAuth2 validation handler.
        services.AddAuthentication()
            .AddOAuthValidation();

        // Register the OpenIddict services.
        // Note: use the generic overload if you need
        // to replace the default OpenIddict entities.
        services.AddOpenIddict(options =>
        {
            // Register the Entity Framework stores.
            options.AddEntityFrameworkCoreStores<ApplicationDbContext>();

            // Register the ASP.NET Core MVC binder used by OpenIddict.
            // Note: if you don't call this method, you won't be able to
            // bind OpenIdConnectRequest or OpenIdConnectResponse parameters.
            options.AddMvcBinders();

            // Enable the token endpoint (required to use the password flow).
            options.EnableTokenEndpoint("/connect/token");

            // Allow client applications to use the grant_type=password flow.
            options.AllowPasswordFlow();

            // During development, you can disable the HTTPS requirement.
            options.DisableHttpsRequirement();
        });
    }
    ```

    > **Note:** for more information about the different options and configurations available, check out 
    [Configuration and options](https://github.com/openiddict/core/wiki/Configuration-and-options)
    in the project wiki.

  - **Make sure the authentication middleware is registered before all the other middleware, including `app.UseMvc()`**:

    ```csharp
    public void Configure(IApplicationBuilder app)
    {
        app.UseAuthentication();

        app.UseMvc();
    }
    ```

  - **Update your Entity Framework Core context registration to register the OpenIddict entities**:

    ```csharp
    services.AddDbContext<ApplicationDbContext>(options =>
    {
        // Configure the context to use Microsoft SQL Server.
        options.UseSqlServer(configuration["Data:DefaultConnection:ConnectionString"]);

        // Register the entity sets needed by OpenIddict.
        // Note: use the generic overload if you need
        // to replace the default OpenIddict entities.
        options.UseOpenIddict();
    });
    ```

    > **Note:** if you change the default entity primary key (e.g. to `int` or `Guid` instead of `string`), make sure to use the `services.AddOpenIddict()` extension accepting a `TKey` generic argument and use the generic `options.UseOpenIddict<TKey>()` overload.

  - **Create your own authorization controller**:

    To **support the password or the client credentials flow, you must provide your own token endpoint action**.
    To enable authorization code/implicit flows support, you'll similarly have to create your own authorization endpoint action and your own views/view models.

    The **Mvc.Server sample comes with an [`AuthorizationController` that supports both the password flow and the authorization code flow and that you can easily reuse in your application](https://github.com/openiddict/openiddict-core/blob/dev/samples/Mvc.Server/Controllers/AuthorizationController.cs)**.

  - **Enable the corresponding flows in the OpenIddict options**:

    ```csharp
    public void ConfigureServices(IServiceCollection services)
    {
        // Register the OpenIddict services.
        // Note: use the generic overload if you need
        // to replace the default OpenIddict entities.
        services.AddOpenIddict(options =>
        {
            // Register the Entity Framework stores.
            options.AddEntityFrameworkCoreStores<ApplicationDbContext>();

            // Register the ASP.NET Core MVC binder used by OpenIddict.
            // Note: if you don't call this method, you won't be able to
            // bind OpenIdConnectRequest or OpenIdConnectResponse parameters.
            options.AddMvcBinders();

            // Enable the authorization and token endpoints (required to use the code flow).
            options.EnableAuthorizationEndpoint("/connect/authorize")
                .EnableTokenEndpoint("/connect/token");

            // Allow client applications to use the code flow.
            options.AllowAuthorizationCodeFlow();

            // During development, you can disable the HTTPS requirement.
            options.DisableHttpsRequirement();
        });
    }
    ```

  - **Register your client application**:

    ```csharp
    // Create a new service scope to ensure the database context is correctly disposed when this methods returns.
    using (var scope = app.ApplicationServices.GetRequiredService<IServiceScopeFactory>().CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await context.Database.EnsureCreatedAsync();

        // Note: when using a custom entity or a custom key type, replace OpenIddictApplication by the appropriate type.
        var manager = scope.ServiceProvider.GetRequiredService<OpenIddictApplicationManager<OpenIddictApplication>>();

        if (await manager.FindByClientIdAsync("[client identifier]", cancellationToken) == null)
        {
            var descriptor = new OpenIddictApplicationDescriptor
            {
                ClientId = "[client identifier]",
                ClientSecret = "[client secret]",
                RedirectUris = { new Uri("[redirect uri]") }
            };

            await manager.CreateAsync(descriptor, cancellationToken);
        }
    }
    ```