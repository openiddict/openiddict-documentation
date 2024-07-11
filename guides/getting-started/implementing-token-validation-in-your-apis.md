# Implementing token validation in your APIs

**To implement token validation support for your APIs, the simplest option is to clone one of the official samples**
from the [openiddict-samples repository](https://github.com/openiddict/openiddict-samples).

If you don't want to start from one of the recommended samples, you'll need to:

  - **Reference the `OpenIddict.AspNetCore` package**:

    ```xml
    <PackageReference Include="OpenIddict.AspNetCore" Version="5.7.0" />
    ```

  - **Configure the OpenIddict validation services** in `Startup.ConfigureServices`:
    - If the APIs are located in the same project as the OpenIddict server, you can use the `options.UseLocalServer()`
    API to import the configuration from the local server instance, including the signing and encryption keys:

    ```csharp
    services.AddOpenIddict()

        // Register the OpenIddict validation components.
        .AddValidation(options =>
        {
            // Import the configuration from the local OpenIddict server instance.
            options.UseLocalServer();

            // Register the ASP.NET Core host.
            options.UseAspNetCore();
        });
    ```

    - If the APIs are located in a different project, you'll need to use OpenID Connect discovery to download the
    configuration from the remote server instance, including the public signing keys. You'll also need to update
    the server configuration to use a secret or a X.509 encryption certificate that will be shared with the APIs to
    be able to decrypt the received access tokens:

    ```csharp
    services.AddOpenIddict()
        .AddServer(options =>
        {    
            // Register the encryption credentials. This sample uses a symmetric
            // encryption key that is shared between the server and the API project.
            //
            // Note: in a real world application, this encryption key should be
            // stored in a safe place (e.g in Azure KeyVault, stored as a secret).
            options.AddEncryptionKey(new SymmetricSecurityKey(
                Convert.FromBase64String("DRjd/GnduI3Efzen9V9BvbNUfc/VKgXltV7Kbk9sMkY=")));

            // Register the signing credentials.
            options.AddDevelopmentSigningCertificate();
        });
    ```

    ```csharp
    services.AddOpenIddict()
        .AddValidation(options =>
        {
            // Note: the validation handler uses OpenID Connect discovery
            // to retrieve the issuer signing keys used to validate tokens.
            options.SetIssuer("https://localhost:44319/");

            // Register the encryption credentials. This sample uses a symmetric
            // encryption key that is shared between the server and the API project.
            //
            // Note: in a real world application, this encryption key should be
            // stored in a safe place (e.g in Azure KeyVault, stored as a secret).
            options.AddEncryptionKey(new SymmetricSecurityKey(
                Convert.FromBase64String("DRjd/GnduI3Efzen9V9BvbNUfc/VKgXltV7Kbk9sMkY=")));

            // Register the System.Net.Http integration.
            options.UseSystemNetHttp();

            // Register the ASP.NET Core host.
            options.UseAspNetCore();
        });
    ```

  - **Configure your API controllers** to use token authentication by decorating them with
  `[Authorize(AuthenticationSchemes = OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme)]`:

    ```csharp
    [Authorize(AuthenticationSchemes = OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme)]
    [Route("api")]
    public class ResourceController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public ResourceController(UserManager<ApplicationUser> userManager)
            => _userManager = userManager;

        [HttpGet("message")]
        public async Task<IActionResult> GetMessage()
        {
            // This demo action requires that the client application be granted the "demo_api" scope.
            // If it was not granted, a detailed error is returned to the client application to inform it
            // that the authorization process must be restarted with the specified scope to access this API.
            if (!User.HasScope("demo_api"))
            {
                return Forbid(
                    authenticationSchemes: OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme,
                    properties: new AuthenticationProperties(new Dictionary<string, string>
                    {
                        [OpenIddictValidationAspNetCoreConstants.Properties.Scope] = "demo_api",
                        [OpenIddictValidationAspNetCoreConstants.Properties.Error] = Errors.InsufficientScope,
                        [OpenIddictValidationAspNetCoreConstants.Properties.ErrorDescription] =
                            "The 'demo_api' scope is required to perform this action."
                    }));
            }

            var user = await _userManager.FindByIdAsync(User.GetClaim(Claims.Subject));
            if (user is null)
            {
                return Challenge(
                    authenticationSchemes: OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme,
                    properties: new AuthenticationProperties(new Dictionary<string, string>
                    {
                        [OpenIddictValidationAspNetCoreConstants.Properties.Error] = Errors.InvalidToken,
                        [OpenIddictValidationAspNetCoreConstants.Properties.ErrorDescription] =
                            "The specified access token is bound to an account that no longer exists."
                    }));
            }

            return Content($"{user.UserName} has been successfully authenticated.");
        }
    }
    ```

    > [!NOTE]
    > Alternatively, if you prefer enforcing token authentication globally, you can configure the ASP.NET Core
    > authentication stack to use `OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme` as the default scheme:
    >
    > ```csharp
    > services.AddAuthentication(options =>
    > {
    >     options.DefaultScheme = OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme;
    > });
    > ```
    >
    > Note: this approach is not recommended in applications configured to support both cookie and token authentication.

Recommended read: [Creating your own server instance](creating-your-own-server-instance.md).