# Entity Framework Core 集成 <Badge type="info" text="core" />

## 基本配置

要配置 OpenIddict 使用 Entity Framework Core 作为应用程序、授权、范围和令牌的数据库，您需要：

  - **引用 `OpenIddict.EntityFrameworkCore` 包**：

  ```xml
  <PackageReference Include="OpenIddict.EntityFrameworkCore" Version="6.2.0" />
  ```

  - **创建一个继承自 `DbContext` 的数据库上下文（使用 ASP.NET Core Identity 时继承自 `IdentityDbContext`）**：

  ```csharp
  public class ApplicationDbContext : DbContext
  {
      public ApplicationDbContext(DbContextOptions options)
          : base(options)
      {
      }
  }
  ```

  - **配置 OpenIddict 使用 Entity Framework Core 存储**：

  ```csharp
  services.AddOpenIddict()
      .AddCore(options =>
      {
          options.UseEntityFrameworkCore()
                 .UseDbContext<ApplicationDbContext>();
      });
  ```

  - **配置 Entity Framework Core 在模型中注册 OpenIddict 实体**：

  ```csharp
  services.AddDbContext<ApplicationDbContext>(options =>
  {
      // 配置 Entity Framework Core 使用 Microsoft SQL Server
      options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection"));

      // 注册 OpenIddict 所需的实体集
      options.UseOpenIddict();
  });
  ```

  - **使用迁移或重新创建数据库以添加 OpenIddict 实体**。
  更多信息，请阅读[迁移概述](https://docs.microsoft.com/en-us/ef/core/managing-schemas/migrations/)。

## 高级配置

### 使用自定义主键类型

默认情况下，Entity Framework Core 集成使用 `string` 类型的主键，这与 ASP.NET Core Identity 使用的默认键类型相匹配。

要使用不同的键类型（例如 `int`、`long` 或 `Guid`）：
  - **调用泛型 `ReplaceDefaultEntities<TKey>()` 方法强制 OpenIddict 使用具有指定键类型的默认实体**：

  ```csharp
  services.AddOpenIddict()
      .AddCore(options =>
      {
          // 配置 OpenIddict 使用具有自定义键类型的默认实体
          options.UseEntityFrameworkCore()
                 .UseDbContext<ApplicationDbContext>()
                 .ReplaceDefaultEntities<Guid>();
      });
  ```

  - **配置 Entity Framework Core 在模型中包含具有所选键类型的默认实体**：

  ```csharp
  services.AddDbContext<ApplicationDbContext>(options =>
  {
      // 配置 Entity Framework Core 使用 Microsoft SQL Server
      options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection"));

      // 注册 OpenIddict 所需的实体集，但使用自定义键类型
      options.UseOpenIddict<Guid>();
  });
  ```

### 使用自定义实体

对于需要存储 OpenIddict 使用的属性之外的其他数据的应用程序，可以使用自定义实体。为此，您需要：
  - **创建自定义实体**：

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

  - **调用泛型 `ReplaceDefaultEntities<TApplication, TAuthorization, TScope, TToken, TKey>()` 方法强制 OpenIddict 使用自定义实体**：

  ```csharp
  services.AddOpenIddict()
      .AddCore(options =>
      {
          // 配置 OpenIddict 使用自定义实体
          options.UseEntityFrameworkCore()
                 .UseDbContext<ApplicationDbContext>()
                 .ReplaceDefaultEntities<CustomApplication, CustomAuthorization, CustomScope, CustomToken, long>();
      });
  ```

  - **配置 Entity Framework Core 在模型中包含自定义实体**：

  ```csharp
  services.AddDbContext<ApplicationDbContext>(options =>
  {
      // 配置 Entity Framework Core 使用 Microsoft SQL Server
      options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection"));

      // 注册 OpenIddict 所需的实体集，但使用指定的实体而不是默认实体
      options.UseOpenIddict<CustomApplication, CustomAuthorization, CustomScope, CustomToken, long>();
  });
  ```
