# Quartz.NET integration

## Basic configuration

To configure OpenIddict to use Quartz.NET to perform automated cleanup tasks, you'll need to:
  - **Reference the `OpenIddict.Quartz` package**:

  ```xml
  <PackageReference Include="OpenIddict.Quartz" Version="5.7.0" />
  ```

  - **Register the Quartz.NET services and configure it to use dependency injection and an in-memory store**:

  ```csharp
  services.AddQuartz(options =>
  {
      options.UseMicrosoftDependencyInjectionJobFactory();
      options.UseSimpleTypeLoader();
      options.UseInMemoryStore();
  })
  ```

    For more information, read [Microsoft DI Integration](https://www.quartz-scheduler.net/documentation/quartz-3.x/packages/microsoft-di-integration.html).

  - **Register the Quartz.NET hosted service and configure it to block shutdown until all jobs are complete**:

  ```csharp
  services.AddQuartzHostedService(options => options.WaitForJobsToComplete = true);
  ```

    For more information, read [Hosted Services Integration](https://www.quartz-scheduler.net/documentation/quartz-3.x/packages/hosted-services-integration.html).

  - **Configure OpenIddict to use the Quartz.NET integration**:

  ```csharp
  services.AddOpenIddict()
      .AddCore(options =>
      {
          options.UseQuartz();
      });
  ```

## Advanced configuration

### Disable pruning

The default cleanup task of the Quartz.NET integration automatically removes orphaned tokens and authorizations.
This behavior can be customized by disabling any (or both) pruning jobs:

```csharp
services.AddOpenIddict()
    .AddCore(options =>
    {
        options.UseQuartz()
            .DisableAuthorizationPruning()
            .DisableTokenPruning();
    });
```

### Pruning lifetime

All tokens/authorizations will be removed during the pruning job if they are older than 14 days.
This lifespan can be changed for tokens and authorizations independently:

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
> The mimum lifespan for pruning is **10 minutes**.

### Retry failed jobs

Any failed Quartz.NET job will be retried twice by default.
This retry count can be configured with this setting:

```csharp
services.AddOpenIddict()
    .AddCore(options =>
    {
        options.UseQuartz()
            .SetMaximumRefireCount(3);
    });
```