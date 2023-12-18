# OpenIddict documentation

This repository provides the documentation for the [OpenIddict](https://github.com/openiddict) project.

## Security policy

Security issues and bugs should be reported privately by emailing security@openiddict.com.
You should receive a response within 24 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

## Development

In order to build and run the documentation locally, follow these steps:

1. Clone the Git repository including submodules:

   ```bash
   git clone --recurse-submodules https://github.com/openiddict/openiddict-documentation.git
   ```

2. Install [docfx](https://dotnet.github.io/docfx/) as a global tool:

   ```bash
   dotnet tool update -g docfx
   ```

3. Build the documentation and serve it locally:

   ```bash
   docfx docfx.json --serve
   ```

   The documentation will be available on http://localhost:8080.

## Support

If you need support, please make sure you [sponsor the project](https://github.com/sponsors/kevinchalet) before creating a GitHub ticket.
If you're not a sponsor, you can post your questions on Gitter or StackOverflow:

- **Gitter: [https://app.gitter.im/#/room/#openiddict_openiddict-core:gitter.im](https://app.gitter.im/#/room/#openiddict_openiddict-core:gitter.im)**
- **StackOverflow: [https://stackoverflow.com/questions/tagged/openiddict](https://stackoverflow.com/questions/tagged/openiddict)**

> **Note**
> With OpenIddict 5.0 being now generally available, the previous version, OpenIddict 4.0, stops being supported and won't receive bug
> fixes or security updates. As such, it is recommended to migrate to OpenIddict 5.0 to continue receiving bug and security fixes.
> 
> **There are, however, two exceptions to this policy**:
>   - **ABP Framework 7.0 users will still receive patches for OpenIddict 4.x for as long as ABP Framework 7.0 itself is supported by Volosoft**
>   (typically a year following the release of ABP 8.0), whether they have a commercial ABP license or just use the free packages.
> 
>   - **OpenIddict sponsors who have opted for a $250+/month sponsorship are now offered extended support:**
>     - $250/month sponsors get full support for OpenIddict 4.x until June 18, 2024 (6 months).
>     - $500/month sponsors get full support for OpenIddict 4.x until December 18, 2024 (12 months).
>     - $1,000/month sponsors get full support for OpenIddict 4.x until December 18, 2025 (24 months).

## Contributors

**OpenIddict** is actively maintained by **[Kévin Chalet](https://github.com/kevinchalet)**. Contributions are welcome and can be submitted using pull requests.

## License

This project is licensed under the **Apache License**. This means that you can use, modify and distribute it freely. See [http://www.apache.org/licenses/LICENSE-2.0.html](http://www.apache.org/licenses/LICENSE-2.0.html) for more details.
