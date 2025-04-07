# Quartz.NET 集成 <Badge type="info" text="core" />

## 基础配置

要配置 OpenIddict 使用 Quartz.NET 执行自动清理任务，你需要：
  - **引用 `OpenIddict.Quartz` 包**：

  ```xml
  <PackageReference Include="OpenIddict.Quartz" Version="6.2.0" />
  ```

  - **注册 Quartz.NET 服务并配置它使用依赖注入和内存存储**：

  ```csharp
  services.AddQuartz(options =>
  {
      options.UseMicrosoftDependencyInjectionJobFactory();
      options.UseSimpleTypeLoader();
      options.UseInMemoryStore();
  })
  ```

  > [!TIP]
  > 更多信息请参阅 [Microsoft DI 集成](https://www.quartz-scheduler.net/documentation/quartz-3.x/packages/microsoft-di-integration.html)。

  - **注册 Quartz.NET 托管服务并配置它在所有任务完成前阻止关闭**：

  ```csharp
  services.AddQuartzHostedService(options => options.WaitForJobsToComplete = true);
  ```

  > [!TIP]
  > 更多信息请参阅 [托管服务集成](https://www.quartz-scheduler.net/documentation/quartz-3.x/packages/hosted-services-integration.html)。

  - **配置 OpenIddict 使用 Quartz.NET 集成**：

  ```csharp
  services.AddOpenIddict()
      .AddCore(options =>
      {
          options.UseQuartz();
      });
  ```

## 高级配置

### 禁用清理

Quartz.NET 集成的默认清理任务会自动删除孤立的令牌和授权。
可以通过禁用任一（或两个）清理任务来自定义此行为：

```csharp
services.AddOpenIddict()
    .AddCore(options =>
    {
        options.UseQuartz()
               .DisableAuthorizationPruning()
               .DisableTokenPruning();
    });
```

### 清理生命周期

在清理任务期间，所有超过 14 天的令牌/授权都将被删除。
可以分别为令牌和授权更改此生命周期：

```csharp
services.AddOpenIddict()
    .AddCore(options =>
    {
        options.UseQuartz()
               .SetMinimumAuthorizationLifespan(TimeSpan.FromDays(7))
               .SetMinimumTokenLifespan(TimeSpan.FromHours(12));
    });
```

> [!WARNING]
> 清理的最小生命周期为 **10 分钟**。

### 重试失败的任务

默认情况下，任何失败的 Quartz.NET 任务将重试两次。
可以通过以下设置配置重试次数：

```csharp
services.AddOpenIddict()
    .AddCore(options =>
    {
        options.UseQuartz()
               .SetMaximumRefireCount(3);
    });
```
