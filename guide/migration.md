# What's new in OpenIddict RC2?

The full list of changes can be found [here](https://github.com/openiddict/openiddict-core/milestone/8?closed=1). It includes **bug fixes** (including a bug fix in the refresh token handling) and new features like **application permissions**, that allow limiting the OpenID Connect features (endpoints and flows) an application is able to use.

# Migrate to OpenIddict RC2

**Migrating to OpenIddict RC2 (`1.0.0-rc2-*` and `2.0.0-rc2-*`) requires making changes in your database**: existing properties have been reworked (e.g [to work around a MySQL limitation](https://github.com/openiddict/openiddict-core/issues/497)) and new ones have been added to support the new features. This procedure is quite easy and only requires a few minutes.

> Note: this guide assumes your application uses the OpenIddict Entity Framework Core 2.x stores. If you use a custom store, changes will have to be made manually. A list of added/updated/renamed columns is available at the end of this guide.

## Ensure migrations are correctly enabled for your project

**Before migrating to OpenIddict RC2, make sure migrations are already enabled for your application**. If you have a `Migrations` folder in your application root folder and an `__EFMigrationsHistory` table in your database, you're good to go.

If you don't have these Entity Framework Core artificats, migrations are likely not enabled. To fix that, add the following entries in your `.csproj`:

```xml
<ItemGroup>
  <PackageReference Include="Microsoft.EntityFrameworkCore.Design"
                    Version="2.0.0" PrivateAssets="All" />
</ItemGroup>

<ItemGroup>
  <DotNetCliToolReference Include="Microsoft.EntityFrameworkCore.Tools.DotNet"
                          Version="2.0.0" />
</ItemGroup>
```

Then, open a new command line and add an initial migration using `dotnet ef migrations add InitialMigration` (**but don't apply it!**).

## Update your packages references

For that, simply update your `.csproj` file to point to the newest OpenIddict packages:

### ASP.NET Core 1.x

```xml
<ItemGroup>
  <PackageReference Include="OpenIddict" Version="1.0.0-rc2-*" />
  <PackageReference Include="OpenIddict.EntityFrameworkCore" Version="1.0.0-rc2-*" />
  <PackageReference Include="OpenIddict.Mvc" Version="1.0.0-rc2-*" />
</ItemGroup>
```

### ASP.NET Core 2.x

```xml
<ItemGroup>
  <PackageReference Include="OpenIddict" Version="2.0.0-rc2-*" />
  <PackageReference Include="OpenIddict.EntityFrameworkCore" Version="2.0.0-rc2-*" />
  <PackageReference Include="OpenIddict.Mvc" Version="2.0.0-rc2-*" />
</ItemGroup>
```

## Add a new migration

1. First, open a new command line and run `dotnet ef migrations add MigrateToOpenIddictRc2`.
2. **If you created an initial migration at step 1, remove it from the `Migrations` folder**.
3. Apply the `MigrateToOpenIddictRc2` migration using `dotnet ef database update MigrateToOpenIddictRc2`.

## Run the migration script to convert columns to the new format

For that, add the following snippet to your `Startup` class:

```csharp
private async Task UpdateOpenIddictTablesAsync(IServiceProvider services)
{
    using (var scope = services.GetRequiredService<IServiceScopeFactory>().CreateScope())
    {
        // Change ApplicationDbContext to match your context name if you've changed it.
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await context.Database.EnsureCreatedAsync();

        // If you use a different entity type or a custom key,
        // change this line (e.g OpenIddictApplication<long>).
        foreach (var application in context.Set<OpenIddictApplication>())
        {
            // Convert the space-separated PostLogoutRedirectUris property to JSON.
            if (!string.IsNullOrEmpty(application.PostLogoutRedirectUris) &&
                 application.PostLogoutRedirectUris[0] != '[')
            {
                var addresses = application.PostLogoutRedirectUris.Split(
                    new[] { " " }, StringSplitOptions.RemoveEmptyEntries);

                application.PostLogoutRedirectUris =
                    new JArray(addresses).ToString(Formatting.None);
            }

            // Convert the space-separated RedirectUris property to JSON.
            if (!string.IsNullOrEmpty(application.RedirectUris) &&
                 application.RedirectUris[0] != '[')
            {
                var addresses = application.RedirectUris.Split(
                    new[] { " " }, StringSplitOptions.RemoveEmptyEntries);

                application.RedirectUris = new JArray(addresses).ToString(Formatting.None);
            }

            // Grant the application all the permissions. Don't hesitate to update
            // the list to only grant the permissions really needed by the application.
            if (string.IsNullOrEmpty(application.Permissions))
            {
                var permissions = new[]
                {
                    OpenIddictConstants.Permissions.Endpoints.Authorization,
                    OpenIddictConstants.Permissions.Endpoints.Introspection,
                    OpenIddictConstants.Permissions.Endpoints.Logout,
                    OpenIddictConstants.Permissions.Endpoints.Revocation,
                    OpenIddictConstants.Permissions.Endpoints.Token,

                    OpenIddictConstants.Permissions.GrantTypes.AuthorizationCode,
                    OpenIddictConstants.Permissions.GrantTypes.ClientCredentials,
                    OpenIddictConstants.Permissions.GrantTypes.Implicit,
                    OpenIddictConstants.Permissions.GrantTypes.Password,
                    OpenIddictConstants.Permissions.GrantTypes.RefreshToken
                };

                application.Permissions = new JArray(permissions).ToString(Formatting.None);
            }
        }

        // If you use a different entity type or a custom key,
        // change this line (e.g OpenIddictAuthorization<long>).
        foreach (var authorization in context.Set<OpenIddictAuthorization>())
        {
            // Convert the space-separated Scopes property to JSON.
            if (!string.IsNullOrEmpty(authorization.Scopes) && authorization.Scopes[0] != '[')
            {
                var scopes = authorization.Scopes.Split(
                    new[] { " " }, StringSplitOptions.RemoveEmptyEntries);

                authorization.Scopes = new JArray(scopes).ToString(Formatting.None);
            }
        }

        await context.SaveChangesAsync();
    }
}
```

Then, at the end of the `public void Configure(IApplicationBuilder app)` method, add the following line:

```csharp
public void Configure(IApplicationBuilder app)
{
    app.UseDeveloperExceptionPage();

    app.UseStaticFiles();

    app.UseStatusCodePagesWithReExecute("/error");

    app.UseAuthentication();

    app.UseMvcWithDefaultRoute();

    // Run the migration script synchronously.
    UpdateOpenIddictTablesAsync(app.ApplicationServices).GetAwaiter().GetResult();
}

```

Run your application. Once it's correctly started, stop it and remove the migration script.

## List of changes (for applications using custom stores)

### Renamed properties

| Table                    | Old column name | New column name  | Observations                                                               |
|--------------------------|-----------------|------------------|----------------------------------------------------------------------------|
| OpenIddictApplications   | Timestamp       | ConcurrencyToken | The column type was changed to nvarchar to work around a MySQL limitation. |
| OpenIddictAuthorizations | Timestamp       | ConcurrencyToken | The column type was changed to nvarchar to work around a MySQL limitation. |
| OpenIddictScopes         | Timestamp       | ConcurrencyToken | The column type was changed to nvarchar to work around a MySQL limitation. |
| OpenIddictTokens         | Timestamp       | ConcurrencyToken | The column type was changed to nvarchar to work around a MySQL limitation. |
| OpenIddictTokens         | Ciphertext      | Payload          |                                                                            |
| OpenIddictTokens         | Hash            | ReferenceId      |                                                                            |

### Added properties

| Table                    | Column name | Type          | Nullable |
|--------------------------|-------------|---------------|----------|
| OpenIddictApplications   | Properties  | nvarchar(max) | Yes      |
| OpenIddictApplications   | Permissions | nvarchar(max) | Yes      |
| OpenIddictAuthorizations | Properties  | nvarchar(max) | Yes      |
| OpenIddictScopes         | Properties  | nvarchar(max) | Yes      |
| OpenIddictTokens         | Properties  | nvarchar(max) | Yes      |