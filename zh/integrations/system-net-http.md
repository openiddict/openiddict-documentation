# `System.Net.Http` 集成 <Badge type="warning" text="client" /><Badge type="tip" text="validation" />

为了能够与 HTTP 服务器通信，OpenIddict 客户端和验证堆栈依赖于名为 `OpenIddict.Client.SystemNetHttp` 和 `OpenIddict.Validation.SystemNetHttp` 的配套包。

> [!INFO]
> 这些包负责实例化发送 HTTP 请求所需的 `HttpClient` 对象（使用 `Microsoft.Extensions.Http`）并管理它们的生命周期。它们还负责准备 `HttpRequestMessage` 实例，并在收到 HTTP 响应后提取相应的 `HttpResponseMessage`。

## 基本配置 <Badge type="warning" text="client" /><Badge type="tip" text="validation" />

要配置 `System.Net.Http` 集成，您需要：
  - **引用 `OpenIddict.Client.SystemNetHttp` 和/或 `OpenIddict.Validation.SystemNetHttp` 包**
  （取决于您的项目中是否需要客户端和/或验证功能）：

  ```xml
  <PackageReference Include="OpenIddict.Client.SystemNetHttp" Version="6.2.0" />
  <PackageReference Include="OpenIddict.Validation.SystemNetHttp" Version="6.2.0" />
  ```

  - **为每个您想要添加的 OpenIddict 功能（客户端和验证）调用 `UseSystemNetHttp()`**：

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

## 高级配置

### 配置联系地址 <Badge type="warning" text="client" /><Badge type="tip" text="validation" />

`System.Net.Http` 集成允许设置一个电子邮件地址，该地址将作为标准 `From` HTTP 标头的一部分发送。
虽然不是严格要求，但这样做可以帮助第三方管理的授权服务器在他们认为您使用他们的服务出现问题时联系您：

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

### 配置产品名称 <Badge type="warning" text="client" /><Badge type="tip" text="validation" />

虽然 OpenIddict 始终发送默认的 `User-Agent`（包含 `System.Net.Http` 集成的名称和其 .NET 程序集版本），
但建议设置产品名称和产品版本，以帮助 OpenIddict 发送更详细的 `User-Agent` 标头：

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

也可以使用特定 .NET `Assembly` 的标识：

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

### 配置自定义 HTTP 错误策略 <Badge type="warning" text="client" /><Badge type="tip" text="validation" />

为了缓解临时性 HTTP 错误（例如临时连接问题），OpenIddict 使用默认错误策略，
该策略会自动重试发送失败的 HTTP 请求最多 4 次。虽然默认策略适用于大多数应用程序，
但可以使用 `SetHttpErrorPolicy()` API 覆盖默认策略：

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
> 在 .NET 8.0 及更高版本中，OpenIddict 不再默认注册 `IAsyncPolicy<HttpResponseMessage>`，
> 而是使用 `ResiliencePipeline<HttpResponseMessage>`。如果您决定显式配置 HTTP 错误策略，
> 无论您使用默认实例还是自定义弹性管道，HTTP 弹性管道都将被忽略。

### 配置自定义 HTTP 弹性管道 <Badge type="warning" text="client" /><Badge type="tip" text="validation" />

在 .NET 8.0 及更高版本中，OpenIddict 使用 `ResiliencePipeline<HttpResponseMessage>` 而不是 `IAsyncPolicy<HttpResponseMessage>`
来处理临时性 HTTP 错误（失败的 HTTP 请求最多重试 4 次）。虽然默认弹性管道适用于大多数应用程序，
但可以使用 `SetHttpResiliencePipeline()` API 覆盖默认弹性管道：

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

### 注册自定义 `HttpClient` 配置委托 <Badge type="warning" text="client" /><Badge type="tip" text="validation" />

对于需要调整 OpenIddict 使用的 `HttpClient` 实例的场景（例如添加自定义静态标头），
可以使用 `ConfigureHttpClient()` API 注册 `Action<HttpClient>` 配置委托：

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

OpenIddict 客户端集成还允许配置特定提供程序的委托：

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseSystemNetHttp()
               .ConfigureHttpClient(Providers.GitHub, client => client.DefaultRequestHeaders.Add("Custom-Header", "value"));
    });
```

对于高级场景，可以使用 `Action<OpenIddictClientRegistration, HttpClient>` 委托：

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

### 注册自定义 `HttpClientHandler` 配置委托 <Badge type="warning" text="client" /><Badge type="tip" text="validation" />

对于需要调整 OpenIddict 使用的 `HttpClientHandler` 实例的场景（例如在开发期间覆盖或禁用 TLS 服务器证书验证逻辑），
可以使用 `ConfigureHttpClientHandler()` API 注册 `Action<HttpClientHandler>` 配置委托：

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

OpenIddict 客户端集成还允许配置特定提供程序的委托：

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseSystemNetHttp()
               .ConfigureHttpClientHandler(Providers.GitHub, handler => handler.ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator);
    });
```

对于高级场景，可以使用 `Action<OpenIddictClientRegistration, HttpClientHandler>` 委托：

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
