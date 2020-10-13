# Getting started

To use OpenIddict, you need to:

  - **Install the latest [.NET Core 2.x tooling](https://www.microsoft.com/net/download) and update your packages to reference the ASP.NET Core 2.x packages**.

  - **Have an existing project or create a new one**: when creating a new project using Visual Studio's default ASP.NET Core template, using **individual user accounts authentication** is strongly recommended. When updating an existing project, you must provide your own `AccountController` to handle the registration process and the authentication flow.

  - **Update your `.csproj` file** to reference the `OpenIddict` packages:

    ```xml
    <PackageReference Include="OpenIddict" Version="2.0.0-*" />
    <PackageReference Include="OpenIddict.EntityFrameworkCore" Version="2.0.0-*" />
    ```

  - **OPTIONAL: If you want to try out the latest features and bug fixes,** there is a MyGet feed with nightly builds
    of OpenIddict.

    To reference the OpenIddict MyGet feed, **create a `NuGet.config` file** (at the root of your solution):

    ```xml
    <?xml version="1.0" encoding="utf-8"?>
    <configuration>
    <packageSources>
        <add key="nuget" value="https://api.nuget.org/v3/index.json" />
        <add key="openiddict" value="https://www.myget.org/F/openiddict/api/v3/index.json" />
    </packageSources>
    </configuration>
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

        // Register the OpenIddict services.
        services.AddOpenIddict()
            .AddCore(options =>
            {
                // Configure OpenIddict to use the Entity Framework Core stores and entities.
                options.UseEntityFrameworkCore()
                       .UseDbContext<ApplicationDbContext>();
            })

            .AddServer(options =>
            {
                // Register the ASP.NET Core MVC binder used by OpenIddict.
                // Note: if you don't call this method, you won't be able to
                // bind OpenIdConnectRequest or OpenIdConnectResponse parameters.
                options.UseMvc();

                // Enable the token endpoint (required to use the password flow).
                options.EnableTokenEndpoint("/connect/token");

                // Allow client applications to use the grant_type=password flow.
                options.AllowPasswordFlow();

                // During development, you can disable the HTTPS requirement.
                options.DisableHttpsRequirement();

                // Accept token requests that don't specify a client_id.
                options.AcceptAnonymousClients();
            })

            .AddValidation();
    }
    ```

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

> **Note:** if you change the default entity primary key (e.g. to `int` or `Guid` instead of `string`), make sure you use the `options.ReplaceDefaultEntities<TKey>()` core extension accepting a `TKey` generic argument and use the generic `options.UseOpenIddict<TKey>()` overload to configure Entity Framework Core to use the specified key type:
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

  - **Create your own authorization controller**:

To **support the password or the client credentials flow, you must provide your own token endpoint action**.
To enable authorization code/implicit flows support, you'll similarly have to create your own authorization endpoint action and your own views/view models.

The **Mvc.Server sample comes with an [`AuthorizationController` that supports both the password flow and the authorization code flow and that you can easily reuse in your application](https://github.com/openiddict/openiddict-core/blob/dev/samples/Mvc.Server/Controllers/AuthorizationController.cs)**.

  - **Enable the corresponding flows in the OpenIddict options**:

    ```csharp
    public void ConfigureServices(IServiceCollection services)
    {
        // Register the OpenIddict services.
        services.AddOpenIddict()
            .AddCore(options =>
            {
                // Configure OpenIddict to use the Entity Framework Core stores and entities.
                options.UseEntityFrameworkCore()
                       .UseDbContext<ApplicationDbContext>();
            })

            .AddServer(options =>
            {
                // Register the ASP.NET Core MVC binder used by OpenIddict.
                // Note: if you don't call this method, you won't be able to
                // bind OpenIdConnectRequest or OpenIdConnectResponse parameters.
                options.UseMvc();

                // Enable the authorization/token endpoints (required to use the code flow).
                options.EnableAuthorizationEndpoint("/connect/authorize")
                       .EnableTokenEndpoint("/connect/token");

                // Allow client applications to use the code flow.
                options.AllowAuthorizationCodeFlow();

                // During development, you can disable the HTTPS requirement.
                options.DisableHttpsRequirement();
            })

            .AddValidation();
    }
    ```

  - **Register your client application**:

    ```csharp
    // Create a new service scope to ensure the database context
    // is correctly disposed when this methods returns.
    using (var scope = app.ApplicationServices.CreateScope())
    {
        var provider = scope.ServiceProvider;
        var context = provider.GetRequiredService<ApplicationDbContext>();
        await context.Database.EnsureCreatedAsync();

        var manager = provider.GetRequiredService<IOpenIddictApplicationManager>();

        if (await manager.FindByClientIdAsync("[client identifier]") == null)
        {
            var descriptor = new OpenIddictApplicationDescriptor
            {
                ClientId = "[client identifier]",
                ClientSecret = "[client secret]",
                RedirectUris = { new Uri("[redirect uri]") }
            };

            await manager.CreateAsync(descriptor);
        }
    }
    ```