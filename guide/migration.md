> [!NOTE]
> This documentation is a work-in-progress. To contribute, please visit https://github.com/openiddict/openiddict-documentation.

# Migrate to OpenIddict 1.0/2.0

## What's new?

The announcement listing the changes introduced in this milestone can be found [here](https://kevinchalet.com/2018/11/01/openiddict-1-0-and-2-0-general-availability/).

## Update your packages references

For that, simply update your `.csproj` file to point to the newest OpenIddict packages:

### ASP.NET Core 1.x

```xml
<ItemGroup>
  <PackageReference Include="OpenIddict" Version="1.0.0" />
  <PackageReference Include="OpenIddict.EntityFrameworkCore" Version="1.0.0" />
</ItemGroup>
```

### ASP.NET Core 2.x

```xml
<ItemGroup>
  <PackageReference Include="OpenIddict" Version="2.0.0" />
  <PackageReference Include="OpenIddict.EntityFrameworkCore" Version="2.0.0" />
</ItemGroup>
```

No additional change should be required for basic scenarios.

# Migrate to OpenIddict 1.0/2.0 rc3

## What's new?

The announcement listing the changes introduced in this milestone can be found [here](https://kevinchalet.com/2018/06/20/openiddict-rc3-is-out/).

## Update your packages references

For that, simply update your `.csproj` file to point to the newest OpenIddict packages:

### ASP.NET Core 1.x

```xml
<ItemGroup>
  <PackageReference Include="OpenIddict" Version="1.0.0-rc3-final" />
  <PackageReference Include="OpenIddict.EntityFrameworkCore" Version="1.0.0-rc3-final" />
</ItemGroup>
```

### ASP.NET Core 2.x

```xml
<ItemGroup>
  <PackageReference Include="OpenIddict" Version="2.0.0-rc3-final" />
  <PackageReference Include="OpenIddict.EntityFrameworkCore" Version="2.0.0-rc3-final" />
</ItemGroup>
```

> [!TIP]
> If you have an explicit reference to `AspNet.Security.OAuth.Validation` or `OpenIddict.Mvc`,
> you can safely remove these dependencies: they are now transitively referenced by the `OpenIddict` metapackage.

> [!IMPORTANT]
> If your application references `OpenIddict.Models` or `OpenIddict.Stores`, you MUST remove them as these packages are no longer used in rc3.

## Use the new OpenIddict services registration APIs

To offer a better user experience, the registrations APIs exposed by OpenIddict have been reworked. Updating your code should be quite straightforward:

```csharp
// In OpenIddict rc2, all the options used to be grouped.
services.AddOpenIddict(options =>
{
    options.AddEntityFrameworkCoreStores<ApplicationDbContext>();

    options.AddMvcBinders();

    options.EnableAuthorizationEndpoint("/connect/authorize")
           .EnableLogoutEndpoint("/connect/logout")
           .EnableTokenEndpoint("/connect/token")
           .EnableUserinfoEndpoint("/api/userinfo");

    options.AllowAuthorizationCodeFlow()
           .AllowPasswordFlow()
           .AllowRefreshTokenFlow();

    options.RegisterScopes(OpenIdConnectConstants.Scopes.Email,
                           OpenIdConnectConstants.Scopes.Profile,
                           OpenIddictConstants.Scopes.Roles);

    options.RequireClientIdentification();

    options.EnableRequestCaching();

    options.EnableScopeValidation();

    options.DisableHttpsRequirement();
});
```

```csharp
// In OpenIddict rc3, the options are now split into 3 categories:
// the core services, the server services and the validation services.
services.AddOpenIddict()
    .AddCore(options =>
    {
        // AddEntityFrameworkCoreStores() is now UseEntityFrameworkCore().
        options.UseEntityFrameworkCore()
               .UseDbContext<ApplicationDbContext>();
    })

    .AddServer(options =>
    {
        // AddMvcBinders() is now UseMvc().
        options.UseMvc();

        options.EnableAuthorizationEndpoint("/connect/authorize")
               .EnableLogoutEndpoint("/connect/logout")
               .EnableTokenEndpoint("/connect/token")
               .EnableUserinfoEndpoint("/api/userinfo");

        options.AllowAuthorizationCodeFlow()
               .AllowPasswordFlow()
               .AllowRefreshTokenFlow();

        options.RegisterScopes(OpenIdConnectConstants.Scopes.Email,
                               OpenIdConnectConstants.Scopes.Profile,
                               OpenIddictConstants.Scopes.Roles);

        // This API was removed as client identification is now
        // required by default. You can remove or comment this line.
        //
        // options.RequireClientIdentification();

        options.EnableRequestCaching();

        // This API was removed as scope validation is now enforced
        // by default. You can safely remove or comment this line.
        //
        // options.EnableScopeValidation();

        options.DisableHttpsRequirement();
    });
```

## Move to the OpenIddict validation handler (optional)

While not required, moving to the new validation handler is recommended:

```csharp
// Replace...
services.AddAuthentication()
    .AddOAuthValidation();

// ... by:
services.AddOpenIddict()
    .AddValidation();
```

> [!TIP]
> The OpenIddict validation handler lives in the `OpenIddict.Validation` package, which is referenced by the `OpenIddict` metapackage.
> You don't have to explicitly add a new `PackageReference` in your `.csproj` file to be able to use it.

## If necessary, create new application entries

OpenIddict now rejects unauthenticated token/revocation requests by default.

If, after migrating to rc3, you see errors similar to this one:

> **invalid_request** : The mandatory 'client_id' parameter is missing.

Add an application entry for the client application and send the corresponding `client_id` as part of the token request:

```csharp
var descriptor = new OpenIddictApplicationDescriptor
{
    ClientId = "postman",
    DisplayName = "Postman",
    Permissions =
    {
        OpenIddictConstants.Permissions.Endpoints.Token,
        OpenIddictConstants.Permissions.GrantTypes.Password,
        OpenIddictConstants.Permissions.GrantTypes.RefreshToken,
        OpenIddictConstants.Permissions.Scopes.Email,
        OpenIddictConstants.Permissions.Scopes.Profile,
        OpenIddictConstants.Permissions.Scopes.Roles
    }
};

await _applicationManager.CreateAsync(descriptor);
```

If you prefer accepting anonymous clients, use `options.AcceptAnonymousClients()`:

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        options.AcceptAnonymousClients();
    });
```

## If necessary, register the scopes used by your clients

Starting with rc3, OpenIddict will reject unrecognized scopes by default.

If, after migrating to rc3, you see errors similar to this one:

> **invalid_scope** : The specified 'scope' parameter is not valid.

Simply add the scopes you want to use to the list of registered scopes:

```csharp
services.AddOpenIddict()

    // Register the OpenIddict server handler.
    .AddServer(options =>
    {
        options.RegisterScopes(OpenIdConnectConstants.Scopes.Email,
                               OpenIdConnectConstants.Scopes.Profile,
                               OpenIddictConstants.Scopes.Roles);
    });
```

If you prefer disabling scope validation, use `options.DisableScopeValidation()`:

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        options.DisableScopeValidation();
    });
```

## If necessary, adjust the permissions granted to your clients

**Starting with rc3, permissions are no longer optional nor implicit**:
if you don't explicitly grant an application the necessary permissions, it will be blocked by OpenIddict.

To attach permissions to an application, use `OpenIddictApplicationManager`:

```csharp
var descriptor = new OpenIddictApplicationDescriptor
{
    ClientId = "mvc",
    ClientSecret = "901564A5-E7FE-42CB-B10D-61EF6A8F3654",
    DisplayName = "MVC client application",
    PostLogoutRedirectUris = { new Uri("http://localhost:53507/signout-callback-oidc") },
    RedirectUris = { new Uri("http://localhost:53507/signin-oidc") },
    Permissions =
    {
        OpenIddictConstants.Permissions.Endpoints.Authorization,
        OpenIddictConstants.Permissions.Endpoints.Logout,
        OpenIddictConstants.Permissions.Endpoints.Token,
        OpenIddictConstants.Permissions.GrantTypes.AuthorizationCode,
        OpenIddictConstants.Permissions.GrantTypes.RefreshToken,
        OpenIddictConstants.Permissions.Scopes.Email,
        OpenIddictConstants.Permissions.Scopes.Profile,
        OpenIddictConstants.Permissions.Scopes.Roles
    }
};

await _applicationManager.CreateAsync(descriptor);
```

If you don't care about permissions (e.g because you don't have third-party clients), you can instead disable them:

```csharp
services.AddOpenIddict()

    // Register the OpenIddict server handler.
    .AddServer(options =>
    {
        options.IgnoreEndpointPermissions()
               .IgnoreGrantTypePermissions()
               .IgnoreScopePermissions();
    });
```

---------------------------
# Migrate to OpenIddict 1.0/2.0 rc2

## What's new?

The full list of changes can be found [here](https://github.com/openiddict/openiddict-core/milestone/8?closed=1). It includes **bug fixes** (including a bug fix in the refresh token handling)
and new features like **application permissions**, that allow limiting the OpenID Connect features (endpoints and flows) an application is able to use.

**Migrating to OpenIddict rc2 (`1.0.0-rc2-final` and `2.0.0-rc2-final`) requires making changes in your database**: existing properties have been reworked
(e.g [to work around a MySQL limitation](https://github.com/openiddict/openiddict-core/issues/497)) and new ones have been added to support the new features.
This procedure is quite easy and only requires a few minutes.

> [!TIP]
> This guide assumes your application uses the OpenIddict Entity Framework Core 2.x stores. If you use a custom store, changes will have to be made manually.
> A list of added/updated/renamed columns is available at the end of this guide.

## Ensure migrations are correctly enabled for your project

**Before migrating to OpenIddict rc2, make sure migrations are already enabled for your application**. If you have a `Migrations`
folder in your application root folder and an `__EFMigrationsHistory` table in your database, you're good to go.

If you don't have these Entity Framework Core artifacts, migrations are likely not enabled. To fix that, add the following entries in your `.csproj`:

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
  <PackageReference Include="OpenIddict" Version="1.0.0-rc2-final" />
  <PackageReference Include="OpenIddict.EntityFrameworkCore" Version="1.0.0-rc2-final" />
  <PackageReference Include="OpenIddict.Mvc" Version="1.0.0-rc2-final" />
</ItemGroup>
```

### ASP.NET Core 2.x

```xml
<ItemGroup>
  <PackageReference Include="OpenIddict" Version="2.0.0-rc2-final" />
  <PackageReference Include="OpenIddict.EntityFrameworkCore" Version="2.0.0-rc2-final" />
  <PackageReference Include="OpenIddict.Mvc" Version="2.0.0-rc2-final" />
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

## If your authorization server uses introspection, make sure resources are set in the authentication ticket

**Setting an explicit list of resources is now required to allow client applications to introspect a token.**
For that, call `ticket.SetResources()` with the list of the client identifiers allowed to validate the token. E.g:

```csharp
var ticket = new AuthenticationTicket(
    new ClaimsPrincipal(identity),
    new AuthenticationProperties(),
    OpenIdConnectServerDefaults.AuthenticationScheme);

ticket.SetResources("tracking_api", "marketing_api");
```

## Optionally, update your code to grant applications the minimum required permissions

Starting with rc2, OpenIddict includes an optional feature codenamed "app permissions" that allows
controlling and limiting the OAuth2/OpenID Connect features a client application is able to use.

To learn more about this feature, read the [Application permissions documentation](../configuration/application-permissions.md).

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

### Updated properties

| Table                    | Column name            | Observations                                                                |
|--------------------------|------------------------|-----------------------------------------------------------------------------|
| OpenIddictApplications   | PostLogoutRedirectUris | Values are now formatted as JSON arrays instead of space-separated strings. |
| OpenIddictApplications   | RedirectUris           | Values are now formatted as JSON arrays instead of space-separated strings. |
| OpenIddictAuthorizations | Scopes                 | Values are now formatted as JSON arrays instead of space-separated strings. |

### Added properties

| Table                    | Column name | Type          | Nullable |
|--------------------------|-------------|---------------|----------|
| OpenIddictApplications   | ConsentType | nvarchar(max) | Yes      |
| OpenIddictApplications   | Properties  | nvarchar(max) | Yes      |
| OpenIddictApplications   | Permissions | nvarchar(max) | Yes      |
| OpenIddictAuthorizations | Properties  | nvarchar(max) | Yes      |
| OpenIddictScopes         | DisplayName | nvarchar(max) | Yes      |
| OpenIddictScopes         | Properties  | nvarchar(max) | Yes      |
| OpenIddictScopes         | Resources   | nvarchar(max) | Yes      |
| OpenIddictTokens         | Properties  | nvarchar(max) | Yes      |