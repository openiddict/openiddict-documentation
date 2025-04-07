# MongoDB 集成 <Badge type="info" text="core" />

## 基本配置

要将 OpenIddict 配置为使用 MongoDB 作为应用程序、授权、范围和令牌的数据库，您需要：
  - **引用 `OpenIddict.MongoDb` 包**：

  ```xml
  <PackageReference Include="OpenIddict.MongoDb" Version="6.2.0" />
  ```

  - **配置 OpenIddict 使用 MongoDB 存储**：

  ```csharp
  services.AddOpenIddict()
      .AddCore(options =>
      {
          // 注意：要使用远程服务器，请调用接受连接字符串或 MongoClientSettings 实例的 MongoClient 构造函数重载。
          options.UseMongoDb()
                 .UseDatabase(new MongoClient().GetDatabase("openiddict"));
      });
  ```

  或者，您可以将 `IMongoDatabase` 实例注册为服务：

  ```csharp
  services.AddOpenIddict()
      .AddCore(options =>
      {
          options.UseMongoDb();
      });

   // 注意：要使用远程服务器，请调用接受连接字符串或 MongoClientSettings 实例的 MongoClient 构造函数重载。
   services.AddSingleton(new MongoClient().GetDatabase("shared-database-instance"));
   ```

  - **创建索引以提高性能**（推荐）：为此，您可以使用以下脚本来初始化数据库并创建 OpenIddict 实体使用的索引：

  ```csharp
  using System.Threading;
  using Microsoft.Extensions.DependencyInjection;
  using Microsoft.Extensions.Options;
  using MongoDB.Driver;
  using OpenIddict.MongoDb;
  using OpenIddict.MongoDb.Models;

  var services = new ServiceCollection();
  services.AddOpenIddict()
      .AddCore(options => options.UseMongoDb());

  services.AddSingleton(new MongoClient("mongodb://localhost:27017").GetDatabase("openiddict"));

  var provider = services.BuildServiceProvider();
  var context = provider.GetRequiredService<IOpenIddictMongoDbContext>();
  var options = provider.GetRequiredService<IOptionsMonitor<OpenIddictMongoDbOptions>>().CurrentValue;
  var database = await context.GetDatabaseAsync(CancellationToken.None);

  var applications = database.GetCollection<OpenIddictMongoDbApplication>(options.ApplicationsCollectionName);

  await applications.Indexes.CreateManyAsync(
  [
      new CreateIndexModel<OpenIddictMongoDbApplication>(
          Builders<OpenIddictMongoDbApplication>.IndexKeys.Ascending(application => application.ClientId),
          new CreateIndexOptions
          {
              Unique = true
          }),

      new CreateIndexModel<OpenIddictMongoDbApplication>(
          Builders<OpenIddictMongoDbApplication>.IndexKeys.Ascending(application => application.PostLogoutRedirectUris),
          new CreateIndexOptions
          {
              Background = true
          }),

      new CreateIndexModel<OpenIddictMongoDbApplication>(
          Builders<OpenIddictMongoDbApplication>.IndexKeys.Ascending(application => application.RedirectUris),
          new CreateIndexOptions
          {
              Background = true
          })
  ]);

  var authorizations = database.GetCollection<OpenIddictMongoDbAuthorization>(options.AuthorizationsCollectionName);

  await authorizations.Indexes.CreateOneAsync(
      new CreateIndexModel<OpenIddictMongoDbAuthorization>(
          Builders<OpenIddictMongoDbAuthorization>.IndexKeys
              .Ascending(authorization => authorization.ApplicationId)
              .Ascending(authorization => authorization.Scopes)
              .Ascending(authorization => authorization.Status)
              .Ascending(authorization => authorization.Subject)
              .Ascending(authorization => authorization.Type),
          new CreateIndexOptions
          {
              Background = true
          }));

  var scopes = database.GetCollection<OpenIddictMongoDbScope>(options.ScopesCollectionName);

  await scopes.Indexes.CreateOneAsync(new CreateIndexModel<OpenIddictMongoDbScope>(
      Builders<OpenIddictMongoDbScope>.IndexKeys.Ascending(scope => scope.Name),
      new CreateIndexOptions
      {
          Unique = true
      }));
  
  var tokens = database.GetCollection<OpenIddictMongoDbToken>(options.TokensCollectionName);

  await tokens.Indexes.CreateManyAsync(
  [
      new CreateIndexModel<OpenIddictMongoDbToken>(
          Builders<OpenIddictMongoDbToken>.IndexKeys.Ascending(token => token.ReferenceId),
          new CreateIndexOptions<OpenIddictMongoDbToken>
          {
              // 注意：Azure Cosmos DB 不支持部分筛选表达式。
              // 作为解决方法，可以移除表达式和唯一约束。
              PartialFilterExpression = Builders<OpenIddictMongoDbToken>.Filter.Exists(token => token.ReferenceId),
              Unique = true
          }),

      new CreateIndexModel<OpenIddictMongoDbToken>(
          Builders<OpenIddictMongoDbToken>.IndexKeys.Ascending(token => token.AuthorizationId),
          new CreateIndexOptions<OpenIddictMongoDbToken>()
          {
              PartialFilterExpression =
                  Builders<OpenIddictMongoDbToken>.Filter.Exists(token => token.AuthorizationId),
          }),

      new CreateIndexModel<OpenIddictMongoDbToken>(
          Builders<OpenIddictMongoDbToken>.IndexKeys
              .Ascending(token => token.ApplicationId)
              .Ascending(token => token.Status)
              .Ascending(token => token.Subject)
              .Ascending(token => token.Type),
          new CreateIndexOptions
          {
              Background = true
          })
  ]);
  ```

## 高级配置

### 使用自定义实体

对于需要存储 OpenIddict 使用的属性之外的其他数据的应用程序，可以使用自定义实体。为此，您需要：
  - **创建自定义实体**：

  ```csharp
  public class CustomApplication : OpenIddictMongoDbApplication
  {
      public string CustomProperty { get; set; }
  }

  public class CustomAuthorization : OpenIddictMongoDbAuthorization
  {
      public string CustomProperty { get; set; }
  }

  public class CustomScope : OpenIddictMongoDbScope
  {
      public string CustomProperty { get; set; }
  }

  public class CustomToken : OpenIddictMongoDbToken
  {
      public string CustomProperty { get; set; }
  }
  ```

  - **配置 MongoDb 使用自定义实体**：

  ```csharp
  services.AddOpenIddict()
      .AddCore(options =>
      {
          options.UseMongoDb()
                 .ReplaceDefaultApplicationEntity<CustomApplication>()
                 .ReplaceDefaultAuthorizationEntity<CustomAuthorization>()
                 .ReplaceDefaultScopeEntity<CustomScope>()
                 .ReplaceDefaultTokenEntity<CustomToken>();
      });
  ```

### 使用自定义集合名称

默认情况下，OpenIddict 使用 `openiddict.[实体名称]s` 模式来确定默认集合名称。
需要使用不同集合名称的应用程序可以使用 `Set*CollectionName()` 辅助方法：

```csharp
services.AddOpenIddict()
    .AddCore(options =>
    {
        options.UseMongoDb()
               .SetApplicationsCollectionName("custom-applications-collection")
               .SetAuthorizationsCollectionName("custom-authorizations-collection")
               .SetScopesCollectionName("custom-scopes-collection")
               .SetTokensCollectionName("custom-tokens-collection");
    });
```
