# Quartz.NET integration

## Basic configuration

To configure OpenIddict to use Quartz.NET to perform automated cleanup tasks, you'll need to:
  - **Reference the `OpenIddict.Quartz` package**:

    ```xml
    <PackageReference Include="OpenIddict.Quartz" Version="4.10.1" />
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