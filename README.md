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

- **Gitter: [https://gitter.im/openiddict/openiddict-core](https://gitter.im/openiddict/openiddict-core)**
- **StackOverflow: [https://stackoverflow.com/questions/tagged/openiddict](https://stackoverflow.com/questions/tagged/openiddict)**

## Contributors

**OpenIddict** is actively maintained by **[Kévin Chalet](https://github.com/kevinchalet)**. Contributions are welcome and can be submitted using pull requests.

## License

This project is licensed under the **Apache License**. This means that you can use, modify and distribute it freely. See [http://www.apache.org/licenses/LICENSE-2.0.html](http://www.apache.org/licenses/LICENSE-2.0.html) for more details.
