# Operating systems integration <Badge type="warning" text="client" />

To integrate with desktop and mobile operating systems, the OpenIddict client comes with a dedicated package called
[`OpenIddict.Client.SystemIntegration`](https://www.nuget.org/packages/OpenIddict.Client.SystemIntegration/) that takes
care of starting the authorization/logout process and handling the callbacks posted to `redirect_uri` or `post_logout_redirect_uri`.

> [!IMPORTANT]
> `OpenIddict.Client.SystemIntegration` leverages the [.NET Generic Host](https://learn.microsoft.com/en-us/dotnet/core/extensions/generic-host)
> to register the hooks necessary to handle protocol activations and manage the lifetime of the embedded web server. While some application
> models (e.g WPF or WinForms) offer excellent .NET Generic Host support, it's not always true: in some cases, adapters may be necessary.

> [!IMPORTANT]
> This documentation exclusively focuses on the configuration of the OpenIddict system integration and doesn't cover
> what's needed to use the [.NET Generic Host](https://learn.microsoft.com/en-us/dotnet/core/extensions/generic-host).
> For more information on how to configure it, refer to the documentation applicable to your application model.

> [!TIP]
> You can find samples using the OpenIddict client system integration in the [samples repository](https://github.com/openiddict/openiddict-samples):
>
> | Application model      | Supported OS   |                                                                                                                                     |
> |------------------------|----------------|-------------------------------------------------------------------------------------------------------------------------------------|
> | Console                | Windows, Linux | [`Mimban.Client`](https://github.com/openiddict/openiddict-samples/tree/dev/samples/Mimban/Mimban.Client)                           |
> | WinForms               | Windows        | [`Sorgan.WinForms.Client`](https://github.com/openiddict/openiddict-samples/tree/dev/samples/Sorgan/Sorgan.WinForms.Client)         |
> | WPF                    | Windows        | [`Sorgan.Wpf.Client`](https://github.com/openiddict/openiddict-samples/tree/dev/samples/Sorgan/Sorgan.Wpf.Client)                   |
> | Blazor Hybrid (on WPF) | Windows        | [`Sorgan.BlazorHybrid.Client`](https://github.com/openiddict/openiddict-samples/tree/dev/samples/Sorgan/Sorgan.BlazorHybrid.Client) |

## Supported platforms

OpenIddict 5.8+ supports the following operating systems:
  - Android 5.0+ (Android API 21+)
  - iOS 12.0+
  - Linux
  - macOS 10.15+
  - Mac Catalyst 13.1+
  - Windows 7 SP1

> [!IMPORTANT]
> The `OpenIddict.Client.SystemIntegration` package doesn't depend on a specific application model and has been designed to be usable in most types of applications.
> 
> That said, two technical aspects limit cases where the OpenIddict client can be used:
>   - **.NET Standard 2.0 support**: OpenIddict depends on packages that require .NET Standard 2.0 support (for instance, the `Microsoft.Extensions.*` packages),
>   which excludes all the applications that run on a limited .NET flavor, like Windows 8's universal apps or UWP applications prior to Windows 10 1809,
>   as these legacy platforms don't expose any of the APIs introduced in .NET Standard 2.0.
> 
>   - **.NET Generic Host support**: while the .NET Generic Host can be theoretically used in any application that can target .NET Standard 2.0, not all
>   application models will offer a perfect experience:
>     - Windows and Linux .NET console applications don't need anything specific as the .NET Generic Host already ships with a built-in `.UseConsoleLifetime()`
>     extension that takes care of managing the lifetime of the host (typically, by listening to `CTRL+C` combinations and `SIGTERM` events).
> 
>     - WinForms and Windows Presentation Foundation applications can reference the 
>     [Dapplo.Microsoft.Extensions.Hosting.WinForms](https://www.nuget.org/packages/Dapplo.Microsoft.Extensions.Hosting.WinForms/) and
>     [Dapplo.Microsoft.Extensions.Hosting.Wpf](https://www.nuget.org/packages/Dapplo.Microsoft.Extensions.Hosting.Wpf/) packages
>     developed by [Robin Krom](https://github.com/Lakritzator): the result is both very clean and perfectly integrated.
> 
>     - While there's currently no .NET Generic Host companion package for WinUI 3 applications,
>     a pull request proposed by [Jöra Malek](https://github.com/AliveDevil) should address that in the future:
>     [Implement WinUI](https://github.com/dapplo/Dapplo.Microsoft.Extensions.Hosting/pull/37).
> 
>     - There's currently no integration for WinUI 2/UWP applications, which makes using the .NET Generic Host more complicated.
>     There are also other annoying limitations, like Entity Framework Core not fully supporting UWP.
> 
>     > [!WARNING]
>     > Since Microsoft halted the development of the UWP platform, using the OpenIddict client in UWP applications
>     > should be reserved to developers who are familiar with UWP and its inherent limitations.
> 
>     - While it features an application builder that is inspired by the .NET Generic Host, MAUI doesn't support any of the .NET Generic Host
>     abstractions, like `IHostedService` or `IHostApplicationLifetime` (that are required by the OpenIddict system integration).
> 
>     > [!IMPORTANT]
>     > The MAUI team [is already aware of this limitation](https://github.com/dotnet/maui/issues/2244). In the meantime,
>     > it is possible to work around that by using `IHostedService`/`IHostApplicationLifetime` adapters, as shown in this engineering sample:
>     > [OpenIddict.Sandbox.Maui.Client](https://github.com/openiddict/openiddict-core/tree/dev/sandbox/OpenIddict.Sandbox.Maui.Client).
> 
>     - Similarly to MAUI, [Avalonia UI doesn't natively support the .NET Generic Host](https://github.com/AvaloniaUI/Avalonia/issues/5241),
>     but it should be possible to use it side-by-side with the regular Avalania UI host model.

### Android

The OpenIddict Android integration requires targeting `net8.0-android34.0` (or higher) but can be used in any application running on Android 5.0+ (Android API 21).

### iOS

The OpenIddict iOS integration requires targeting `net8.0-ios17.5` (or higher) but can be used in any application running on iOS 12.0+.

### Mac Catalyst

The OpenIddict Mac Catalyst integration requires targeting `net8.0-maccatalyst17.5` (or higher) but can be used in any application running on Mac Catalyst 13.1+.

### macOS

The OpenIddict macOS integration requires targeting `net8.0-macos14.5` (or higher) but can be used in any application running on macOS 10.15+.

### Windows

The OpenIddict Windows integration can be used in any application running on Windows 7 SP1+ and is compatible with the following frameworks:
  - `net461` (or higher)
  - `uap10.0.17763` (or higher)
  - `net6.0-windows7.0` (or higher)
  - `net6.0-windows10.0.17763` (or higher)

> [!IMPORTANT]
> The ability to use the OpenIddict system integration package with a specific application model depends on the .NET runtime version and the Windows version:
> 
> | Windows version | .NET runtime version | Console            | WinForms           | WPF                | WinUI 2   | WinUI 3   | MAUI      |
> |-----------------|----------------------|--------------------|--------------------|--------------------|-----------|-----------|-----------|
> | Windows 7 SP1   | .NET Framework 4.6.1 | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :x:       | :x:       |
> | Windows 7 SP1   | .NET Framework 4.7.2 | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :x:       | :x:       |
> | Windows 7 SP1   | .NET Framework 4.8   | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :x:       | :x:       |
> | Windows 7 SP1   | .NET 6.0             | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :x:       | :x:       |
> | Windows 7 SP1   | .NET 7.0             | :exclamation:      | :exclamation:      | :exclamation:      | :x:       | :x:       | :x:       |
> | Windows 7 SP1   | .NET 8.0             | :exclamation:      | :exclamation:      | :exclamation:      | :x:       | :x:       | :x:       |
> |                 |                      |                    |                    |                    |           |           |           |
> | Windows 8.1     | .NET Framework 4.6.1 | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :x:       | :x:       |
> | Windows 8.1     | .NET Framework 4.7.2 | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :x:       | :x:       |
> | Windows 8.1     | .NET Framework 4.8   | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :x:       | :x:       |
> | Windows 8.1     | .NET 6.0             | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :x:       | :x:       |
> | Windows 8.1     | .NET 7.0             | :exclamation:      | :exclamation:      | :exclamation:      | :x:       | :x:       | :x:       |
> | Windows 8.1     | .NET 8.0             | :exclamation:      | :exclamation:      | :exclamation:      | :x:       | :x:       | :x:       |
> | Windows 8.1     | .NET Native/UAP      | :x:                | :x:                | :x:                | :x:       | :x:       | :x:       |
> |                 |                      |                    |                    |                    |           |           |           |
> | Windows 10 1507 | .NET Framework 4.6.1 | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :x:       | :x:       |
> | Windows 10 1507 | .NET Framework 4.7.2 | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :x:       | :x:       |
> | Windows 10 1507 | .NET Framework 4.8   | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :x:       | :x:       |
> | Windows 10 1507 | .NET 6.0             | :exclamation:      | :exclamation:      | :exclamation:      | :x:       | :x:       | :x:       |
> | Windows 10 1507 | .NET 7.0             | :exclamation:      | :exclamation:      | :exclamation:      | :x:       | :x:       | :x:       |
> | Windows 10 1507 | .NET 8.0             | :exclamation:      | :exclamation:      | :exclamation:      | :x:       | :x:       | :x:       |
> | Windows 10 1507 | .NET Native/UAP      | :x:                | :x:                | :x:                | :x:       | :x:       | :x:       |
> |                 |                      |                    |                    |                    |           |           |           |
> | Windows 10 1809 | .NET Framework 4.6.1 | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :warning: | :x:       |
> | Windows 10 1809 | .NET Framework 4.7.2 | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :warning: | :x:       |
> | Windows 10 1809 | .NET Framework 4.8   | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :warning: | :x:       |
> | Windows 10 1809 | .NET 6.0             | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :warning: | :warning: |
> | Windows 10 1809 | .NET 7.0             | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :warning: | :warning: |
> | Windows 10 1809 | .NET 8.0             | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :warning: | :warning: |
> | Windows 10 1809 | .NET Native/UAP      | :x:                | :x:                | :x:                | :warning: | :x:       | :x:       |
> |                 |                      |                    |                    |                    |           |           |           |
> | Windows 11 21H2 | .NET Framework 4.6.1 | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :warning: | :x:       |
> | Windows 11 21H2 | .NET Framework 4.7.2 | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :warning: | :x:       |
> | Windows 11 21H2 | .NET Framework 4.8   | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :warning: | :x:       |
> | Windows 11 21H2 | .NET 6.0             | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :warning: | :warning: |
> | Windows 11 21H2 | .NET 7.0             | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :warning: | :warning: |
> | Windows 11 21H2 | .NET 8.0             | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :warning: | :warning: |
> | Windows 11 21H2 | .NET Native/UAP      | :x:                | :x:                | :x:                | :warning: | :x:       | :x:       |
> 
> > [!TIP]
> > WinRT support is only offered when targeting `net461`, `uap10.0.17763` or `net6.0-windows10.0.17763`:
> > the `net6.0-windows7.0` target framework moniker doesn't reference the WinRT APIs.
> 
> > [!WARNING]
> > Microsoft officially stopped supporting Windows 7 in .NET 7.0. As such, applications that still need to be usable on Windows 7
> > should probably stay on .NET Framework 4.8 (or .NET 6.0, but it should be noted that it will reach EoL in November 2024).

## Supported interaction methods

The OpenIddict client system integration supports multiple types of interaction methods to start login and logout demands:

### System browser

The system browser is the default interaction method used by OpenIddict on Linux and Windows: it is a safe and convenient option that natively
supports single-sign-on (SSO) since the authentication cookie used by the authorization server is persisted and managed by the browser itself.

> [!TIP]
> When using the system browser, the configured `redirect_uri` and `post_logout_redirect_uri` can either point to a custom URI scheme
> (see [Protocol activations managed by the OS](#protocol-activations-managed-by-the-os))
> or to the embedded web server (see [Embedded web server](#embedded-web-server)).

### Web authentication broker

While not recommended in most cases, the [`WebAuthenticationBroker` API](https://learn.microsoft.com/en-us/windows/uwp/security/web-authentication-broker)
is supported on UWP.

> [!WARNING]
> `WebAuthenticationBroker` is only supported on WinUI 2.0/UWP applications and cannot be used in WinUI 3.0 applications.

### AS Web authentication session

[`ASWebAuthenticationSession`](https://developer.apple.com/documentation/authenticationservices/aswebauthenticationsession) is supported on iOS,
macOS and Mac Catalyst and is the default option when running on these platforms as it offers a great user experience and an excellent security level.

> [!IMPORTANT]
> When using `ASWebAuthenticationSession`, the configured `redirect_uri` and `post_logout_redirect_uri` MUST point to a custom URI scheme.

### Custom tabs intents

On Android, the OpenIddict client system integration supports the
[`CustomTabsIntent` API](https://developer.android.com/reference/androidx/browser/customtabs/CustomTabsIntent) to initiate authorization and logout demands
and uses it as the default option, as it offers both a good user experience and a good security level.

> [!WARNING]
> Unlike iOS's `ASWebAuthenticationSession` API, using `CustomTabsIntent` requires writing a custom activity
> with an intent filter containing the URI scheme you use for your application to handle the callback requests.
>
> Here's an example using MAUI's `IPlatformApplication` API to resolve the `OpenIddictClientSystemIntegrationService` mediator:
> 
> ```csharp
> [Activity(NoHistory = true, LaunchMode = LaunchMode.SingleTop, Exported = true)]
> [IntentFilter([Intent.ActionView],
>     Categories = [Intent.CategoryDefault, Intent.CategoryBrowsable],
>     DataScheme = "com.openiddict.sandbox.maui.client")]
> public class CallbackActivity : Activity
> {
>     protected override async void OnCreate(Bundle? savedInstanceState)
>     {
>         base.OnCreate(savedInstanceState);
> 
>         if (Intent is not Intent intent)
>         {
>             return;
>         }
> 
>         var provider = IPlatformApplication.Current?.Services ??
>             throw new InvalidOperationException("The dependency injection container cannot be resolved.");
>         var service = provider.GetRequiredService<OpenIddictClientSystemIntegrationService>();
> 
>         try
>         {
>             await service.HandleCustomTabsIntentAsync(intent);
>         }
> 
>         finally
>         {
>             Finish();
>         }
>     }
> }
> ```

## Supported callback methods

The OpenIddict client system integration supports 2 methods to handle post-login and post-logout redirection callbacks
that are not handled by iOS's `ASWebAuthenticationSession`, UWP's `WebAuthenticationBroker` or Android's `CustomTabsIntent`:

### Protocol activations managed by the OS

> [!TIP]
> Protocol activations managed by the OS typically use a custom URI scheme (e.g `com.contoso.client:/cb?code=SplxlOBeZQQYbYS6WxSbIA&state=xyz`).

To use OS-managed protocol activations, at least one custom URI scheme must be registered with the OS:
  - For packaged Windows applications (e.g UWP applications or packaged WinForms/WPF/WinUI 3 applications), it is generally
  done by declaring the desired URI scheme in the application manifest (e.g `<uap:Protocol Name="com.contoso.client"/>`).

  > [!TIP]
  > For more information, see
  > [Handle URI activation](https://learn.microsoft.com/en-us/windows/uwp/launch-resume/handle-uri-activation#step-1-specify-the-extension-point-in-the-package-manifest).

  - For non-packaged Windows applications (e.g traditional Win32 WinForms/WPF applications), by adding a registry entry
  for the desired URI scheme pointing to the executable that will be launched to handle the protocol activation:
      - [Globally, under `HKEY_CLASSES_ROOT`](https://stackoverflow.com/questions/80650/how-do-i-register-a-custom-url-protocol-in-windows)
      (since it requires administrator rights, this would be typically done at the setup stage by the application installer).
      - [Per user, under `HKEY_CURRENT_USER\SOFTWARE\Classes`](https://stackoverflow.com/questions/60545581/oauth-2-0-authorization-for-windows-desktop-application-using-httplistener).

  - For Linux applications, by adding a `[Desktop Entry]`. For more information,
  see [Create a custom URL Protocol Handler](https://unix.stackexchange.com/questions/497146/create-a-custom-url-protocol-handler).

> [!TIP]
> To extract and handle protocol activations transparently in multi-instance applications, OpenIddict implements a blocking `IHostedService` that determines
> whether the current application instance was created to react to a protocol activation (either using the WinRT
> [`AppInstance.GetActivatedEventArgs()` API](https://learn.microsoft.com/en-us/uwp/api/windows.applicationmodel.appinstance.getactivatedeventargs?view=winrt-22621)
> or by extracting the protocol activation URI from the command line arguments).
>
> If so, it invokes the OpenIddict client pipeline to handle the authorization response:
> once the response is validated, it is redirected to the correct instance (whose identifier is stored in the state token) and the current instance is terminated.

> [!TIP]
> To handle authorization responses redirected by other instances, it also implements a background `IHostedService` that
> waits for inter-process notifications to be posted to a named pipe. Once the authorization response is transferred, it
> is validated and the call to `AuthenticateInteractivelyAsync()` returns the final response with the authentication details.

### Embedded web server

For scenarios where registering a protocol handler registration is not possible or practical, it is possible to use the embedded HTTP web server
that ships with `OpenIddict.Client.SystemIntegration`: when the application starts, OpenIddict automatically select the first port available in the
`49152-65535` range and starts listening to callback HTTP requests sent to `localhost` (pretty much like how that would work with
`OpenIddict.Client.AspNetCore` or `OpenIddict.Client.Owin`).

> [!IMPORTANT]
> When using the embedded web server to process callback requests, the `redirect_uri`/`post_logout_redirect_uri` MUST point to `http://localhost/`:
> if the remote authorization server supports dynamic ports and the client application was declared as a native application, the port doesn't need
> to be specified: in this case, OpenIddict will attach the port assigned to the embedded web server to the `redirect_uri`/`post_logout_redirect_uri`
> parameters before the login/logout requests are sent to the authorization server.

## Basic configuration

> [!IMPORTANT]
> Being an extension to the OpenIddict client, the OpenIddict system integration requires a properly configured client.
>
> For more information on how to get started with the OpenIddict client,
> read [Integrating with a remote server instance](/guides/getting-started/integrating-with-a-remote-server-instance.md).

To configure the operating system integration, you'll need to:
  - **Reference the `OpenIddict.Client.SystemIntegration` package**:

  ```xml
  <PackageReference Include="OpenIddict.Client.SystemIntegration" Version="5.8.0" />
  ```

  - **Call `UseSystemIntegration()` in the client options**:

  ```csharp
  services.AddOpenIddict()
      .AddClient(options =>
      {
          // ...
  
          options.UseSystemIntegration();
      });
  ```

  - **Review your `redirect_uri`/`post_logout_redirect_uri`**:

  > [!IMPORTANT]
  > By default, the OpenIddict client system integration uses `http://localhost/` as the base URI: this works well when using the
  > embedded web server on Linux and Windows with a remote authorization server supporting dynamic ports, but on iOS, macOS and Android,
  > you're expected to use custom URI schemes to be able to use `ASWebAuthenticationSession` or `CustomTabsIntent`:

  ```csharp
  services.AddOpenIddict()
      .AddClient(options =>
      {
          // ...

          // Add a client registration matching the client application definition in the server project.
          options.AddRegistration(new OpenIddictClientRegistration
          {
              Issuer = new Uri("https://localhost:44395/", UriKind.Absolute),
              ProviderName = "Local",

              ClientId = "maui",

              // This sample uses protocol activations with a custom URI scheme to handle callbacks.
              //
              // For more information on how to construct private-use URI schemes,
              // read https://www.rfc-editor.org/rfc/rfc8252#section-7.1 and
              // https://www.rfc-editor.org/rfc/rfc7595#section-3.8.
              PostLogoutRedirectUri = new Uri("com.openiddict.sandbox.maui.client:/callback/logout/local", UriKind.Absolute),
              RedirectUri = new Uri("com.openiddict.sandbox.maui.client:/callback/login/local", UriKind.Absolute),

              Scopes = { Scopes.Email, Scopes.Profile, Scopes.OfflineAccess, "demo_api" }
          });

          // Register the Web providers integrations.
          //
          // Note: to mitigate mix-up attacks, it's recommended to use a unique redirection endpoint
          // address per provider, unless all the registered providers support returning an "iss"
          // parameter containing their URL as part of authorization responses. For more information,
          // see https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics#section-4.4.
          options.UseWebProviders()
                 .AddTwitter(options =>
                 {
                     options.SetClientId("bXgwc0U3N3A3YWNuaWVsdlRmRWE6MTpjaQ")
                             // Note: Twitter doesn't support the recommended ":/" syntax and requires using "://".
                            .SetRedirectUri("com.openiddict.sandbox.maui.client://callback/login/twitter");
                 });
      });
  ```

Once configured, you can resolve `OpenIddictClientService` from the dependency injection container and use the
`ChallengeInteractivelyAsync()` and `AuthenticateInteractivelyAsync()` APIs to start an interactive authentication process:

```csharp
try
{
    // Ask OpenIddict to initiate the authentication
    // flow (typically, by starting the system browser).
    var result = await _service.ChallengeInteractivelyAsync(new()
    {
        ProviderName = provider
    });

    // Wait for the user to complete the authorization process.
    var response = await _service.AuthenticateInteractivelyAsync(new()
    {
        Nonce = result.Nonce
    });

    MessageBox.Show($"Welcome, {response.Principal.FindFirst(ClaimTypes.Name)!.Value}.",
        "Authentication successful", MessageBoxButton.OK, MessageBoxImage.Information);
}

catch (ProtocolException exception) when (exception.Error is Errors.AccessDenied)
{
    MessageBox.Show("The authorization was denied by the end user.",
        "Authorization denied", MessageBoxButtons.OK, MessageBoxIcon.Warning);
}
```

## Advanced configuration

### Non-default interaction methods

OpenIddict automatically selects the best interaction method to use depending on the operating system on which the application is running.

While using the default method is recommended, it is possible to force OpenIddict to use a specific method:

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseSystemIntegration()
               .UseSystemBrowser();
    });
```

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseSystemIntegration()
               .UseASWebAuthenticationSession();
    });
```

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseSystemIntegration()
               .UseCustomTabsIntent();
    });
```

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseSystemIntegration()
               .UseWebAuthenticationBroker();
    });
```

> [!WARNING]
> OpenIddict will throw a `PlatformNotSupportedException` if the method you selected isn't supported by the platform.

### Activation handling and redirection

On Linux and Windows, OpenIddict automatically processes protocol activations and redirects them to the correct instance
of your application if necessary. While not recommended, this mechanism can also be explicitly enabled on other platforms:

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseSystemIntegration()
               .EnableActivationHandling()
               .EnableActivationRedirection();
    });
```

Both protocol activation handling and redirection can be explicitly disabled on Linux and Windows if necessary:

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseSystemIntegration()
               .DisableActivationHandling()
               .DisableActivationRedirection();
    });
```

### Pipe options and security

Redirection of protocol activations uses named pipes. The default options and ACL applied to the created pipe server and client
can be overridden using the `SetPipeName()`, `SetPipeOptions()` and `SetPipeSecurity()` APIs:

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseSystemIntegration()
               .SetPipeName("PIPE_NAME")
               .SetPipeOptions(...)
               .SetPipeSecurity(...);
    });
```

> [!TIP]
> The default pipe ACL on Windows allows communication between non-elevated processed and evalated processes running
> under the same user account. You can override that using the `SetPipeSecurity()` API if the default policy is not adequate.

### HTTP requests handling by the embedded web server

On Linux and Windows, OpenIddict automatically starts an embedded HTTP server to process callbacks pointing to `localhost`.
While not recommended, this mechanism can also be explicitly enabled on other platforms:

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseSystemIntegration()
               .EnableEmbeddedWebServer();
    });
```

The embedded web server can be explicitly disabled on Linux and Windows if necessary:

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseSystemIntegration()
               .DisableEmbeddedWebServer();
    });
```

If the remote authorization server doesn't support native applications or doesn't allow using dynamic ports,
you can also specify an ordered list of ports that OpenIddict will try to use when starting the embedded web server:

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseSystemIntegration()
               .SetAllowedEmbeddedWebServerPorts(17812, 17813, 17814);
    });
```
