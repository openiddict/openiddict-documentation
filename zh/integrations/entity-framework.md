# Entity Framework 6.x 集成 <Badge type="info" text="core" />

## 基本配置

要将 OpenIddict 配置为使用 Entity Framework 6.x 作为应用程序、授权、范围和令牌的数据库，您需要：
  - **引用 `OpenIddict.EntityFramework` 包**：

  ```xml
  <PackageReference Include="OpenIddict.EntityFramework" Version="6.2.0" />
  ```

  - **创建一个继承自 `DbContext` 的数据库上下文，并在模型中注册 OpenIddict 实体**：

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

  - **配置 OpenIddict 使用 Entity Framework 6.x 存储**：

  ```csharp
  services.AddOpenIddict()
      .AddCore(options =>
      {
          options.UseEntityFramework()
                 .UseDbContext<ApplicationDbContext>();
      });
  ```

  - **使用迁移或重新创建数据库以添加 OpenIddict 实体**。
有关更多信息，请阅读 [Code First 迁移](https://docs.microsoft.com/en-us/ef/ef6/modeling/code-first/migrations/)。

## 高级配置

### 使用自定义主键类型

默认情况下，Entity Framework 6.x 集成使用 `string` 类型的主键，这与 ASP.NET Identity 使用的默认键类型相匹配。

> [!WARNING]
> 与 Entity Framework Core 不同，Entity Framework 6.x 不支持封闭泛型类型，这导致无法在不子类化的情况下使用 OpenIddict 实体。
> 因此，在 Entity Framework 6.x 中使用自定义主键类型比在 Entity Framework Core 中更复杂，需要实现自定义实体，如下一节所述。

### 使用自定义实体

对于需要在 OpenIddict 使用的属性之外存储额外数据的应用程序，可以使用自定义实体。为此，您需要：
  - **创建自定义实体**：

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

  - **调用泛型方法 `ReplaceDefaultEntities<TApplication, TAuthorization, TScope, TToken, TKey>()` 强制 OpenIddict 使用自定义实体**：

  ```csharp
  services.AddOpenIddict()
      .AddCore(options =>
      {
          // 配置 OpenIddict 使用自定义实体
          options.UseEntityFramework()
                 .UseDbContext<ApplicationDbContext>()
                 .ReplaceDefaultEntities<CustomApplication, CustomAuthorization, CustomScope, CustomToken, long>();
      });
  ```

  - **在模型中注册自定义实体**：

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
