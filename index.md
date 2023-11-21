# OpenIddict

### The OpenID Connect stack you'll be addicted to.

[![Build status](https://github.com/openiddict/openiddict-core/workflows/build/badge.svg?branch=dev&event=push)](https://github.com/openiddict/openiddict-core/actions?query=workflow%3Abuild+branch%3Adev+event%3Apush)

## What's OpenIddict?

OpenIddict aims at providing a **versatile solution** to implement **OpenID Connect client, server and token validation support in any ASP.NET Core 2.1 (and higher) application**.
**ASP.NET 4.6.1 (and higher) applications are also fully supported thanks to a native Microsoft.Owin 4.2 integration**.

OpenIddict fully supports the **[code/implicit/hybrid flows](http://openid.net/specs/openid-connect-core-1_0.html)**,
the **[client credentials/resource owner password grants](https://tools.ietf.org/html/rfc6749)** and the [device authorization flow](https://tools.ietf.org/html/rfc8628).

OpenIddict natively supports **[Entity Framework Core](https://www.nuget.org/packages/OpenIddict.EntityFrameworkCore)**,
**[Entity Framework 6](https://www.nuget.org/packages/OpenIddict.EntityFramework)** and **[MongoDB](https://www.nuget.org/packages/OpenIddict.MongoDb)**
out-of-the-box and custom stores can be implemented to support other providers.

--------------

## Getting started

**Developers looking for a simple and turnkey solution are strongly encouraged to use [OrchardCore and its OpenID module](https://docs.orchardcore.net/en/latest/docs/reference/modules/OpenId/)**,
which is based on OpenIddict, comes with sensible defaults and offers a built-in management GUI to easily register OpenID client applications.

**To implement a custom OpenID Connect server using OpenIddict, read [Getting started](https://documentation.openiddict.com/guides/getting-started.html)**.

**Samples demonstrating how to use OpenIddict with the different OAuth 2.0/OpenID Connect flows**
can be found in the [dedicated repository](https://github.com/openiddict/openiddict-samples).

--------------

## Compatibility matrix

| Web framework version | .NET runtime version | OpenIddict 4.x                          | OpenIddict 5.x (preview)                |
|-----------------------|----------------------|-----------------------------------------|-----------------------------------------|
| ASP.NET Core 2.1      | .NET Framework 4.6.1 | :heavy_check_mark: :information_source: | :heavy_check_mark: :information_source: |
| ASP.NET Core 2.1      | .NET Framework 4.7.2 | :heavy_check_mark:                      | :heavy_check_mark:                      |
| ASP.NET Core 2.1      | .NET Framework 4.8   | :heavy_check_mark:                      | :heavy_check_mark:                      |
| ASP.NET Core 2.1      | .NET Core 2.1        | :exclamation:                           | :exclamation:                           |
|                       |                      |                                         |                                         |
| ASP.NET Core 3.1      | .NET Core 3.1        | :heavy_check_mark:                      | :exclamation:                           |
|                       |                      |                                         |                                         |
| ASP.NET Core 5.0      | .NET 5.0             | :exclamation:                           | :exclamation:                           |
| ASP.NET Core 6.0      | .NET 6.0             | :heavy_check_mark:                      | :heavy_check_mark:                      |
| ASP.NET Core 7.0      | .NET 7.0             | :heavy_check_mark:                      | :heavy_check_mark:                      |
| ASP.NET Core 8.0      | .NET 8.0             | :heavy_check_mark:                      | :heavy_check_mark:                      |
|                       |                      |                                         |                                         |
| Microsoft.Owin 4.2    | .NET Framework 4.6.1 | :heavy_check_mark: :information_source: | :heavy_check_mark: :information_source: |
| Microsoft.Owin 4.2    | .NET Framework 4.7.2 | :heavy_check_mark:                      | :heavy_check_mark:                      |
| Microsoft.Owin 4.2    | .NET Framework 4.8   | :heavy_check_mark:                      | :heavy_check_mark:                      |

:exclamation: **ASP.NET Core 2.1 on .NET Core 2.1, ASP.NET Core 3.1 and 5.0 are no longer supported by Microsoft. While OpenIddict can still be used
> on these platforms thanks to its .NET Standard 2.0 compatibility, users are strongly encouraged to migrate to ASP.NET Core/.NET 6.0**.

:information_source: **Note: the following features are not available when targeting .NET Framework 4.6.1**:
 - X.509 development encryption/signing certificates: calling `AddDevelopmentEncryptionCertificate()` or `AddDevelopmentSigningCertificate()`
will result in a `PlatformNotSupportedException` being thrown at runtime if no valid development certificate can be found and a new one must be generated.
 - X.509 ECDSA signing certificates/keys: calling `AddSigningCertificate()` or `AddSigningKey()`
with an ECDSA certificate/key will always result in a `PlatformNotSupportedException` being thrown at runtime.

--------------

## Certification

Unlike many other identity providers, **OpenIddict is not a turnkey solution but a framework that requires writing custom code**
to be operational (typically, at least an authorization controller), making it a poor candidate for the certification program.

While a reference implementation could be submitted as-is, **this wouldn't guarantee that implementations deployed by OpenIddict users would be standard-compliant.**

Instead, **developers are encouraged to execute the conformance tests against their own deployment** once they've implemented their own logic.

> The samples repository contains [a dedicated sample](https://github.com/openiddict/openiddict-samples/tree/dev/samples/Contruum/Contruum.Server) specially designed to be used
> with the OpenID Connect Provider Certification tool and demonstrate that OpenIddict can be easily used in a certified implementation. To allow executing the certification tests
> as fast as possible, that sample doesn't include any membership or consent feature (two hardcoded identities are proposed for tests that require switching between identities).

--------------

## Resources

**Looking for additional resources to help you get started with OpenIddict?** Don't miss these interesting blog posts:

- **[OpenIddict 4.0 preview1 is out](https://kevinchalet.com/2022/06/22/openiddict-4-0-preview1-is-out/)** by [Kévin Chalet](https://github.com/kevinchalet)
- **[Introducing the OpenIddict-powered providers](https://github.com/aspnet-contrib/AspNet.Security.OAuth.Providers/issues/694)** by [Kévin Chalet](https://github.com/kevinchalet)
- **[Introducing the OpenIddict client](https://kevinchalet.com/2022/02/25/introducing-the-openiddict-client/)** by [Kévin Chalet](https://github.com/kevinchalet)
- **[Secure a Blazor WASM ASP.NET Core hosted APP using BFF and OpenIddict](https://damienbod.com/2022/01/03/secure-a-blazor-wasm-asp-net-core-hosted-app-using-bff-and-openiddict/)** by [Damien Bowden](https://github.com/damienbod)
- **[How to Secure ASP.NET Core Applications with OpenIddict Using Virto Commerce B2B eCommerce: Tech Case Study](https://virtocommerce.com/blog/how-to-secure-aspnet-core-applications-with-openiddict-using-virto-commerce-platform)** by [Virto Commerce](https://virtocommerce.com/)
- **[OpenIddict 3.0 general availability](https://kevinchalet.com/2020/12/23/openiddict-3-0-general-availability/)** by [Kévin Chalet](https://github.com/kevinchalet)
- **[Setting up an Authorization Server with OpenIddict](https://dev.to/robinvanderknaap/setting-up-an-authorization-server-with-openiddict-part-i-introduction-4jid)** by [Robin van der Knaap](https://dev.to/robinvanderknaap)
- **[Introducing OpenIddict 3.0's first release candidate version](https://kevinchalet.com/2020/11/17/introducing-openiddict-3-0-s-first-release-candidate-version/)** by [Kévin Chalet](https://github.com/kevinchalet)
- **[OpenIddict 3.0 beta6 is out](https://kevinchalet.com/2020/10/27/openiddict-3-0-beta6-is-out/)** by [Kévin Chalet](https://github.com/kevinchalet)
- **[Introducing Quartz.NET support and new languages in OpenIddict 3.0 beta4](https://kevinchalet.com/2020/10/02/introducing-quartz-net-support-and-new-languages-in-openiddict-3-0-beta4/)** by [Kévin Chalet](https://github.com/kevinchalet)
- **[Introducing localization support in OpenIddict 3.0 beta3](https://kevinchalet.com/2020/08/03/introducing-localization-support-in-openiddict-3-0-beta3/)** by [Kévin Chalet](https://github.com/kevinchalet)
- **[OpenIddict 3.0 beta2 is out](https://kevinchalet.com/2020/07/08/openiddict-3-0-beta2-is-out/)** by [Kévin Chalet](https://github.com/kevinchalet)
- **[Introducing OpenIddict 3.0 beta1](https://kevinchalet.com/2020/06/11/introducing-openiddict-3-0-beta1/)** by [Kévin Chalet](https://github.com/kevinchalet)
- **[Adding OpenIddict 3.0 to an OWIN application](https://kevinchalet.com/2020/03/03/adding-openiddict-3-0-to-an-owin-application/)** by [Kévin Chalet](https://github.com/kevinchalet)
- **[Creating an OpenID Connect server proxy with OpenIddict 3.0's degraded mode](https://kevinchalet.com/2020/02/18/creating-an-openid-connect-server-proxy-with-openiddict-3-0-s-degraded-mode/)** by [Kévin Chalet](https://github.com/kevinchalet)

**OpenIddict-based projects maintained by third parties**:

- **[OrchardCore OpenID module](https://github.com/OrchardCMS/OrchardCore)**: turnkey OpenID Connect server and token validation solution, built with multitenancy in mind
- **[OpenIddict UI](https://github.com/thomasduft/openiddict-ui)** by [Thomas Duft](https://github.com/thomasduft): headless UI for managing client applications and scopes
- **[P41.OpenIddict.CouchDB](https://github.com/panoukos41/couchdb-openiddict)** by [Panos Athanasiou](https://github.com/panoukos41): CouchDB stores for OpenIddict
- **[pixel-identity](https://github.com/Nfactor26/pixel-identity)** by [Nishant Singh](https://github.com/Nfactor26): Ready to host OpenID Connect service using OpenIddict and ASP.NET Identity with a Blazor-based UI for managing users, roles, applications and scopes with support for multiple databases.

--------------

## Security policy

Security issues and bugs should be reported privately by emailing security@openiddict.com.
You should receive a response within 24 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

--------------

## Support

If you need support, please make sure you [sponsor the project](https://github.com/sponsors/kevinchalet) before creating a GitHub ticket.
If you're not a sponsor, you can post your questions on Gitter or StackOverflow:

- **Gitter: [https://gitter.im/openiddict/openiddict-core](https://gitter.im/openiddict/openiddict-core)**
- **StackOverflow: [https://stackoverflow.com/questions/tagged/openiddict](https://stackoverflow.com/questions/tagged/openiddict)**

--------------

## Nightly builds

If you want to try out the latest features and bug fixes, there is a MyGet feed with nightly builds of OpenIddict.
To reference the OpenIddict MyGet feed, **create a `NuGet.config` file** (at the root of your solution):

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <packageSources>
    <add key="nuget" value="https://api.nuget.org/v3/index.json" />
    <add key="openiddict" value="https://www.myget.org/F/openiddict/api/v3/index.json" />
  </packageSources>
</configuration>
```

--------------

## Contributors

**OpenIddict** is actively maintained by **[Kévin Chalet](https://github.com/kevinchalet)**. Contributions are welcome and can be submitted using pull requests.

**Special thanks to [our sponsors](https://github.com/sponsors/kevinchalet#sponsors) for their incredible support**:

<a href="https://volosoft.com/"><img src="https://volosoft.com/assets/logos/volosoft-logo-dark.svg" width="500px" alt="Volosoft logo" /></a>

<!-- sponsors --><a href="https://github.com/sebastienros"><img src="https://github.com/sebastienros.png" width="60px" alt="Sébastien Ros" /></a><a href="https://github.com/schmitch"><img src="https://github.com/schmitch.png" width="60px" alt="Schmitt Christian" /></a><a href="https://github.com/cryo75"><img src="https://github.com/cryo75.png" width="60px" alt="" /></a><a href="https://github.com/florianwachs"><img src="https://github.com/florianwachs.png" width="60px" alt="Florian Wachs" /></a><a href="https://github.com/SebastianStehle"><img src="https://github.com/SebastianStehle.png" width="60px" alt="Sebastian Stehle" /></a><a href="https://github.com/communicatie-cockpit"><img src="https://github.com/communicatie-cockpit.png" width="60px" alt="Communicatie Cockpit" /></a><a href="https://github.com/KeithT"><img src="https://github.com/KeithT.png" width="60px" alt="" /></a><a href="https://github.com/Skrypt"><img src="https://github.com/Skrypt.png" width="60px" alt="Jasmin Savard" /></a><a href="https://github.com/ThomasBjallas"><img src="https://github.com/ThomasBjallas.png" width="60px" alt="Thomas" /></a><a href="https://github.com/mcalasa"><img src="https://github.com/mcalasa.png" width="60px" alt="MCee" /></a><a href="https://github.com/feededit"><img src="https://github.com/feededit.png" width="60px" alt="" /></a><a href="https://github.com/DigitalOpsDev"><img src="https://github.com/DigitalOpsDev.png" width="60px" alt="DigitalOps Co. Ltd." /></a><a href="https://github.com/EYERIDE-Fleet-Management-System"><img src="https://github.com/EYERIDE-Fleet-Management-System.png" width="60px" alt="EYERIDE Fleet Management System" /></a><a href="https://github.com/hypdeb"><img src="https://github.com/hypdeb.png" width="60px" alt="Julien Debache" /></a><a href="https://github.com/StanlyLife"><img src="https://github.com/StanlyLife.png" width="60px" alt="Stian Håve" /></a><a href="https://github.com/ravindUwU"><img src="https://github.com/ravindUwU.png" width="60px" alt="Ravindu Liyanapathirana" /></a><a href="https://github.com/dlandi"><img src="https://github.com/dlandi.png" width="60px" alt="HieronymusBlaze" /></a><a href="https://github.com/ahanoff"><img src="https://github.com/ahanoff.png" width="60px" alt="Akhan Zhakiyanov" /></a><a href="https://github.com/CorentinBrossutti1"><img src="https://github.com/CorentinBrossutti1.png" width="60px" alt="Corentin BROSSUTTI" /></a><a href="https://github.com/blowdart"><img src="https://github.com/blowdart.png" width="60px" alt="Barry Dorrans" /></a><a href="https://github.com/devqsrl"><img src="https://github.com/devqsrl.png" width="60px" alt="DevQ S.r.l." /></a><a href="https://github.com/dgxhubbard"><img src="https://github.com/dgxhubbard.png" width="60px" alt="" /></a><a href="https://github.com/verdie-g"><img src="https://github.com/verdie-g.png" width="60px" alt="Grégoire" /></a><a href="https://github.com/xperiandri"><img src="https://github.com/xperiandri.png" width="60px" alt="Andrii Chebukin" /></a><a href="https://github.com/neil-timmerman"><img src="https://github.com/neil-timmerman.png" width="60px" alt="" /></a><a href="https://github.com/forterro"><img src="https://github.com/forterro.png" width="60px" alt="Forterro" /></a><a href="https://github.com/MarcelMalik"><img src="https://github.com/MarcelMalik.png" width="60px" alt="Marcel" /></a><a href="https://github.com/expeo"><img src="https://github.com/expeo.png" width="60px" alt="" /></a><a href="https://github.com/jwillmer"><img src="https://github.com/jwillmer.png" width="60px" alt="Jens Willmer" /></a><a href="https://github.com/craaash80"><img src="https://github.com/craaash80.png" width="60px" alt="" /></a><a href="https://github.com/BlauhausTechnology"><img src="https://github.com/BlauhausTechnology.png" width="60px" alt="Blauhaus Technology (Pty) Ltd" /></a><a href="https://github.com/trejjam"><img src="https://github.com/trejjam.png" width="60px" alt="Jan Trejbal" /></a><a href="https://github.com/aviationexam"><img src="https://github.com/aviationexam.png" width="60px" alt="Aviationexam s.r.o." /></a><a href="https://github.com/monofor"><img src="https://github.com/monofor.png" width="60px" alt="Monofor" /></a><a href="https://github.com/ratiodata-se"><img src="https://github.com/ratiodata-se.png" width="60px" alt="Ratiodata SE" /></a><a href="https://github.com/DennisvanZetten"><img src="https://github.com/DennisvanZetten.png" width="60px" alt="Dennis van Zetten" /></a><a href="https://github.com/jeroenbai"><img src="https://github.com/jeroenbai.png" width="60px" alt="Jeroen" /></a><!-- sponsors -->

--------------

## License

This project is licensed under the **Apache License**. This means that you can use, modify and distribute it freely.
See [http://www.apache.org/licenses/LICENSE-2.0.html](http://www.apache.org/licenses/LICENSE-2.0.html) for more details.
