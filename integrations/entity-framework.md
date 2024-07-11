# Entity Framework 6.x integration

## Basic configuration

To configure OpenIddict to use Entity Framework 6.x as the database for applications, authorizations, scopes and tokens, you'll need to:
  - **Reference the `OpenIddict.EntityFramework` package**:

  ```xml
  <PackageReference Include="OpenIddict.EntityFramework" Version="5.7.0" />
  ```

  - **Create a database context deriving from `DbContext` and register the OpenIddict entities in the model**:

  ```csharp
  public class ApplicationDbContext : DbContext
  {
      protected override void OnModelCreating(DbModelBuilder modelBuilder)
      {
          base.OnModelCreating(modelBuilder);

          modelBuilder.UseOpenIddict();
      }
  }
  ```

  - **Configure OpenIddict to use the Entity Framework 6.x stores**:

  ```csharp
  services.AddOpenIddict()
      .AddCore(options =>
      {
          options.UseEntityFramework()
                  .UseDbContext<ApplicationDbContext>();
      });
  ```

  - **Use migrations or recreate the database to add the OpenIddict entities**.
For more information, read [Code First Migrations](https://docs.microsoft.com/en-us/ef/ef6/modeling/code-first/migrations/).

## Advanced configuration

### Use a custom primary key type

By default, the Entity Framework 6.x integration uses `string` primary keys, which matches the default key type used by ASP.NET Identity.

> [!WARNING]
> Unlike Entity Framework Core, Entity Framework 6.x doesn't support closed generic types, which prevents using the OpenIddict entities
> without subclassing them. As such, using a custom primary key type is a bit more complicated with Entity Framework 6.x than with
> Entity Framework Core and requires implementing custom entities, as highlighted in the next section.

### Use custom entities

For applications that require storing additional data alongside the properties used by OpenIddict, custom entities can be used. For that, you need to:
  - **Create custom entities**:

  ```csharp
  public class CustomApplication : OpenIddictEntityFrameworkApplication<long, CustomAuthorization, CustomToken>
  {
      public string CustomProperty { get; set; }
  }

  public class CustomAuthorization : OpenIddictEntityFrameworkAuthorization<long, CustomApplication, CustomToken>
  {
      public string CustomProperty { get; set; }
  }

  public class CustomScope : OpenIddictEntityFrameworkScope<long>
  {
      public string CustomProperty { get; set; }
  }

  public class CustomToken : OpenIddictEntityFrameworkToken<long, CustomApplication, CustomAuthorization>
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
          options.UseEntityFramework()
                 .UseDbContext<ApplicationDbContext>()
                 .ReplaceDefaultEntities<CustomApplication, CustomAuthorization, CustomScope, CustomToken, long>();
      });
  ```

  - **Register the custom entities in the model**:

  ```csharp
  public class ApplicationDbContext : DbContext
  {
      protected override void OnModelCreating(DbModelBuilder modelBuilder)
      {
          base.OnModelCreating(modelBuilder);

          modelBuilder.UseOpenIddict<CustomApplication, CustomAuthorization, CustomScope, CustomToken, long>();
      }
  }
  ```