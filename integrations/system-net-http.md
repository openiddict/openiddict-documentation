# `System.Net.Http` integration <Badge type="warning" text="client" /><Badge type="tip" text="validation" />

To be able to communicate with HTTP servers, the OpenIddict client and validation stacks rely on companion packages
named `OpenIddict.Client.SystemNetHttp` and `OpenIddict.Validation.SystemNetHttp`.

> [!INFO]
> These packages are responsible for instantiating the `HttpClient` objects needed to send HTTP requests (using `Microsoft.Extensions.Http`)
> and managing their lifetime. They also take care of preparing the `HttpRequestMessage` instances and extracting the
> corresponding `HttpResponseMessage` once the HTTP response has been received.

## Basic configuration <Badge type="warning" text="client" /><Badge type="tip" text="validation" />

To configure the `System.Net.Http` integration, you'll need to:
  - **Reference the `OpenIddict.Client.SystemNetHttp` and/or `OpenIddict.Validation.SystemNetHttp` packages**
  (depending on whether you need the client and/or validation features in your project):

  ```xml
  <PackageReference Include="OpenIddict.Client.SystemNetHttp" Version="5.7.1" />
  <PackageReference Include="OpenIddict.Validation.SystemNetHttp" Version="5.7.1" />
  ```

  - **Call `UseSystemNetHttp()` for each OpenIddict feature (client and validation) you want to add**:

  ```csharp
  services.AddOpenIddict()
      .AddClient(options =>
      {
          options.UseSystemNetHttp();
      })
      .AddValidation(options =>
      {
          options.UseSystemNetHttp();
      });
  ```

## Advanced configuration

### Configure a contact address <Badge type="warning" text="client" /><Badge type="tip" text="validation" />

The `System.Net.Http` integration allows setting an email address that is sent as part of the standard `From` HTTP header.
While not strictly required, doing that can help authorization servers managed by third parties contact you
when they think something is wrong with your use of their service:

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseSystemNetHttp()
               .SetContactAddress("contact@contoso.com");
    })
    .AddValidation(options =>
    {
        options.UseSystemNetHttp()
               .SetContactAddress("contact@contoso.com");
    });
```

### Configure a product name <Badge type="warning" text="client" /><Badge type="tip" text="validation" />

While OpenIddict always sends a default `User-Agent` (containing the name of the `System.Net.Http` integration and its .NET assembly
version), it is recommended to set a product name and a product version to help OpenIddict send a more detailed `User-Agent` header:

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseSystemNetHttp()
               .SetProductInformation("Contoso", "1.0.0");
    })
    .AddValidation(options =>
    {
        options.UseSystemNetHttp()
               .SetProductInformation("Contoso", "1.0.0");
    });
```

The identity of a specific .NET `Asssembly` can also be used:

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseSystemNetHttp()
               .SetProductInformation(typeof(Program).Assembly);
    })
    .AddValidation(options =>
    {
        options.UseSystemNetHttp()
               .SetProductInformation(typeof(Program).Assembly);
    });
```

### Configure a custom HTTP error policy <Badge type="warning" text="client" /><Badge type="tip" text="validation" />

To mitigate transient HTTP errors (e.g temporary connectivity issues), OpenIddict uses a default error policy
that automatically retries sending a failed HTTP request up to 4 times. While the default policy is appropriate
for most applications, the default policy can be overridden using the `SetHttpErrorPolicy()` API:

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseSystemNetHttp()
               .SetHttpErrorPolicy(HttpPolicyExtensions.HandleTransientHttpError()
                   .OrResult(static response => response.StatusCode is HttpStatusCode.NotFound)
                   .WaitAndRetryAsync(4, static attempt => TimeSpan.FromSeconds(Math.Pow(2, attempt))));
    })
    .AddValidation(options =>
    {
        options.UseSystemNetHttp()
               .SetHttpErrorPolicy(HttpPolicyExtensions.HandleTransientHttpError()
                   .OrResult(static response => response.StatusCode is HttpStatusCode.NotFound)
                   .WaitAndRetryAsync(4, static attempt => TimeSpan.FromSeconds(Math.Pow(2, attempt))));
    });
```

> [!WARNING]
> On .NET 8.0 and higher, OpenIddict no longer registers an `IAsyncPolicy<HttpResponseMessage>` by default and uses
> a `ResiliencePipeline<HttpResponseMessage>` instead. If you decide to explicitly configure an HTTP error policy,
> the HTTP resilience pipeline will be ignored, whether you use the default instance or a custom resilience pipeline.

### Configure a custom HTTP resilience pipeline <Badge type="warning" text="client" /><Badge type="tip" text="validation" />

On .NET 8.0 and higher, OpenIddict uses a `ResiliencePipeline<HttpResponseMessage>` instead of an `IAsyncPolicy<HttpResponseMessage>`
to deal with transient HTTP errors (failed HTTP requests are retried up to 4 times).  While the default resilience pipeline is appropriate
for most applications, the default resilience pipeline can be overridden using the `SetHttpResiliencePipeline()` API:

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseSystemNetHttp()
               .SetHttpResiliencePipeline(builder => builder.AddRetry(new HttpRetryStrategyOptions
               {
                   DelayGenerator = static arguments => new(
                       TimeSpan.FromSeconds(Math.Pow(2, arguments.AttemptNumber))),
                   MaxRetryAttempts = 4,
                   ShouldHandle = static arguments => new(
                       HttpClientResiliencePredicates.IsTransient(arguments.Outcome) ||
                       arguments.Outcome.Result?.StatusCode is HttpStatusCode.NotFound)
               }));
    })
    .AddValidation(options =>
    {
        options.UseSystemNetHttp()
               .SetHttpResiliencePipeline(builder => builder.AddRetry(new HttpRetryStrategyOptions
               {
                   DelayGenerator = static arguments => new(
                       TimeSpan.FromSeconds(Math.Pow(2, arguments.AttemptNumber))),
                   MaxRetryAttempts = 4,
                   ShouldHandle = static arguments => new(
                       HttpClientResiliencePredicates.IsTransient(arguments.Outcome) ||
                       arguments.Outcome.Result?.StatusCode is HttpStatusCode.NotFound)
               }));
    });
```

### Register a custom `HttpClient` configuration delegate <Badge type="warning" text="client" /><Badge type="tip" text="validation" />

For scenarios that require tweaking the `HttpClient` instances used by OpenIddict (e.g to add a custom static header),
an `Action<HttpClient>` configuration delegate can be registered using the `ConfigureHttpClient()` API:

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseSystemNetHttp()
               .ConfigureHttpClient(client => client.DefaultRequestHeaders.Add("Custom-Header", "value"));
    })
    .AddValidation(options =>
    {
        options.UseSystemNetHttp()
               .ConfigureHttpClient(client => client.DefaultRequestHeaders.Add("Custom-Header", "value"));
    });
```

The OpenIddict client integration also allows configuring a provider-specific delegate:

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseSystemNetHttp()
               .ConfigureHttpClient(Providers.GitHub, client => client.DefaultRequestHeaders.Add("Custom-Header", "value"));
    });
```

For advanced scenarios, an `Action<OpenIddictClientRegistration, HttpClient>` delegate can be used instead:

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseSystemNetHttp()
               .ConfigureHttpClient((registration, client) =>
               {
                   if (registration.RegistrationId is "447fbedf-dcec-47b0-9355-6e199e8f2576")
                   {
                       client.DefaultRequestHeaders.Add("Custom-Header", "value");
                   }
               });
    });
```

### Register a custom `HttpClientHandler` configuration delegate <Badge type="warning" text="client" /><Badge type="tip" text="validation" />

For scenarios that require tweaking the `HttpClientHandler` instances used by OpenIddict (e.g to override or disable the
TLS server certificate validation logic during development), an `Action<HttpClientHandler>` configuration delegate can be
registered using the `ConfigureHttpClientHandler()` API:

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseSystemNetHttp()
               .ConfigureHttpClientHandler(handler => handler.ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator);
    })
    .AddValidation(options =>
    {
        options.UseSystemNetHttp()
               .ConfigureHttpClientHandler(handler => handler.ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator);
    });
```

The OpenIddict client integration also allows configuring a provider-specific delegate:

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseSystemNetHttp()
               .ConfigureHttpClientHandler(Providers.GitHub, handler => handler.ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator);
    });
```

For advanced scenarios, an `Action<OpenIddictClientRegistration, HttpClientHandler>` delegate can be used instead:

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseSystemNetHttp()
               .ConfigureHttpClientHandler((registration, handler) =>
               {
                   if (registration.RegistrationId is "447fbedf-dcec-47b0-9355-6e199e8f2576")
                   {
                       handler.ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator;
                   }
               });
    });
```
