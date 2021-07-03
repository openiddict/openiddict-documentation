# MongoDB integration

To configure OpenIddict to use MongoDB as the database for applications, authorizations, scopes and tokens, you'll need to:
  - **Reference the `OpenIddict.MongoDb` package**:
    ```xml
    <PackageReference Include="OpenIddict.MongoDb" Version="3.0.5" />
    ```

  - **Configure OpenIddict to use the MongoDB stores**:
    ```csharp
    services.AddOpenIddict()
        .AddCore(options =>
        {
            // Note: to use a remote server, call the MongoClient constructor overload
            // that accepts a connection string or an instance of MongoClientSettings.
            options.UseMongoDb()
                   .UseDatabase(new MongoClient().GetDatabase("openiddict"));
        });
    ```

    Alternatively, you can register the `IMongoDatabase` instance as a service:

    ```csharp
    services.AddOpenIddict()
        .AddCore(options =>
        {
            options.UseMongoDb();
        });

    // Note: to use a remote server, call the MongoClient constructor overload
    // that accepts a connection string or an instance of MongoClientSettings.
    services.AddSingleton(new MongoClient().GetDatabase("shared-database-instance"));
    ```

  - **Create indexes to improve performance** (recommended): for that, you can use the following script to
initialize the database and create the indexes used by the OpenIddict entities:
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

    services.AddSingleton(new MongoClient(
        "mongodb://localhost:27017").GetDatabase("openiddict"));

    var provider = services.BuildServiceProvider();
    var context = provider.GetRequiredService<IOpenIddictMongoDbContext>();
    var options = provider.GetRequiredService<
        IOptionsMonitor<OpenIddictMongoDbOptions>>().CurrentValue;
    var database = await context.GetDatabaseAsync(CancellationToken.None);

    var applications = database.GetCollection<OpenIddictMongoDbApplication>(
        options.ApplicationsCollectionName);

    await applications.Indexes.CreateManyAsync(new[]
    {
        new CreateIndexModel<OpenIddictMongoDbApplication>(
            Builders<OpenIddictMongoDbApplication>.IndexKeys.Ascending(
                application => application.ClientId),
            new CreateIndexOptions
            {
                Unique = true
            }),

        new CreateIndexModel<OpenIddictMongoDbApplication>(
            Builders<OpenIddictMongoDbApplication>.IndexKeys.Ascending(
                application => application.PostLogoutRedirectUris),
            new CreateIndexOptions
            {
                Background = true
            }),

        new CreateIndexModel<OpenIddictMongoDbApplication>(
            Builders<OpenIddictMongoDbApplication>.IndexKeys.Ascending(
                application => application.RedirectUris),
            new CreateIndexOptions
            {
                Background = true
            })
    });

    var authorizations = database.GetCollection<OpenIddictMongoDbAuthorization>(
        options.AuthorizationsCollectionName);

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

    var scopes = database.GetCollection<OpenIddictMongoDbScope>(
        options.ScopesCollectionName);

    await scopes.Indexes.CreateOneAsync(new CreateIndexModel<OpenIddictMongoDbScope>(
        Builders<OpenIddictMongoDbScope>.IndexKeys.Ascending(scope => scope.Name),
        new CreateIndexOptions
        {
            Unique = true
        }));

    var tokens = database.GetCollection<OpenIddictMongoDbToken>(
        options.TokensCollectionName);

    await tokens.Indexes.CreateManyAsync(new[]
    {
        new CreateIndexModel<OpenIddictMongoDbToken>(
            Builders<OpenIddictMongoDbToken>.IndexKeys.Ascending(
                token => token.ReferenceId),
            new CreateIndexOptions<OpenIddictMongoDbToken>
            {
                // Note: partial filter expressions are not supported on Azure Cosmos DB.
                // As a workaround, the expression and the unique constraint can be removed.
                PartialFilterExpression =
                    Builders<OpenIddictMongoDbToken>.Filter.Exists(
                        token => token.ReferenceId),
                Unique = true
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
    });
    ```