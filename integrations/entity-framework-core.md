# Entity Framework Core integration

## Basic configuration

To configure OpenIddict to use Entity Framework Core as the database for applications, authorizations, scopes and tokens, you'll need to:
  - **Reference the `OpenIddict.EntityFrameworkCore` package**:

    ```xml
    <PackageReference Include="OpenIddict.EntityFrameworkCore" Version="5.7.0" />
    ```

  - **Create a database context deriving from `DbContext` (or `IdentityDbContext` when using ASP.NET Core Identity)**:

    ```csharp
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions options)
            : base(options)
        {
        }
    }
    ```

  - **Configure OpenIddict to use the Entity Framework Core stores**:

    ```csharp
    services.AddOpenIddict()
        .AddCore(options =>
        {
            options.UseEntityFrameworkCore()
                   .UseDbContext<ApplicationDbContext>();
        });
    ```

  - **Configure Entity Framework Core to register the OpenIddict entities in the model**:

    ```csharp
    services.AddDbContext<ApplicationDbContext>(options =>
    {
        // Configure the Entity Framework Core to use Microsoft SQL Server.
        options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection"));

        // Register the entity sets needed by OpenIddict.
        options.UseOpenIddict();
    });
    ```

  - **Use migrations or recreate the database to add the OpenIddict entities**.
For more information, read [Migrations Overview](https://docs.microsoft.com/en-us/ef/core/managing-schemas/migrations/).

## Advanced configuration

### Use a custom primary key type

By default, the Entity Framework Core integration uses `string` primary keys, which matches the default key type used by ASP.NET Core Identity.

To use a different key type (e.g `int`, `long` or `Guid`):
  - **Call the generic `ReplaceDefaultEntities<TKey>()` method to force OpenIddict to use the default entities with the specified key type**:

    ```csharp
    services.AddOpenIddict()
        .AddCore(options =>
        {
            // Configure OpenIddict to use the default entities with a custom key type.
            options.UseEntityFrameworkCore()
                   .UseDbContext<ApplicationDbContext>()
                   .ReplaceDefaultEntities<Guid>();
        });
    ```

  - **Configure Entity Framework Core to include the default entities with the chosen key type in the model**:

    ```csharp
    services.AddDbContext<ApplicationDbContext>(options =>
    {
        // Configure Entity Framework Core to use Microsoft SQL Server.
        options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection"));

        // Register the entity sets needed by OpenIddict but use a custom key type.
        options.UseOpenIddict<Guid>();
    });
    ```

### Use custom entities

For applications that require storing additional data alongside the properties used by OpenIddict, custom entities can be used. For that, you need to:
  - **Create custom entities**:

    ```csharp
    public class CustomApplication : OpenIddictEntityFrameworkCoreApplication<long, CustomAuthorization, CustomToken>
    {
        public string CustomProperty { get; set; }
    }

    public class CustomAuthorization : OpenIddictEntityFrameworkCoreAuthorization<long, CustomApplication, CustomToken>
    {
        public string CustomProperty { get; set; }
    }

    public class CustomScope : OpenIddictEntityFrameworkCoreScope<long>
    {
        public string CustomProperty { get; set; }
    }

    public class CustomToken : OpenIddictEntityFrameworkCoreToken<long, CustomApplication, CustomAuthorization>
    {
        public string CustomProperty { get; set; }
    }
    ```

  - **Call the generic `ReplaceDefaultEntities<TApplication, TAuthorization, TScope, TToken, TKey>()` method to force OpenIddict to use the custom entities**:

    ```csharp
    services.AddOpenIddict()
        .AddCore(options =>
        {
            // Configure OpenIddict to use the custom entities.
            options.UseEntityFrameworkCore()
                   .UseDbContext<ApplicationDbContext>()
                   .ReplaceDefaultEntities<CustomApplication, CustomAuthorization, CustomScope, CustomToken, long>();
        });
    ```

  - **Configure Entity Framework Core to include the custom entities in the model**:

    ```csharp
    services.AddDbContext<ApplicationDbContext>(options =>
    {
        // Configure Entity Framework Core to use Microsoft SQL Server.
        options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection"));

        // Register the entity sets needed by OpenIddict but use the specified entities instead of the default ones.
        options.UseOpenIddict<CustomApplication, CustomAuthorization, CustomScope, CustomToken, long>();
    });
    ```