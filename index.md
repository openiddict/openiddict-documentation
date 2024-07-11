---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: OpenIddict
  text: Versatile OAuth 2.0/OpenID Connect stack for .NET
  tagline: Free and open source ❤
  image:
    src: /openid.svg
    alt: OpenID Connect logo
---

# What is OpenIddict?

OpenIddict aims at providing a **versatile solution** to implement **OpenID Connect client, server and token validation support in any ASP.NET Core 2.1 (and higher) application**.
**ASP.NET 4.6.1 (and higher) applications are also fully supported thanks to a native Microsoft.Owin 4.2 integration**.

OpenIddict fully supports the **[code/implicit/hybrid flows](http://openid.net/specs/openid-connect-core-1_0.html)**,
the **[client credentials/resource owner password grants](https://tools.ietf.org/html/rfc6749)** and the [device authorization flow](https://tools.ietf.org/html/rfc8628).

OpenIddict natively supports **[Entity Framework Core](https://www.nuget.org/packages/OpenIddict.EntityFrameworkCore)**,
**[Entity Framework 6](https://www.nuget.org/packages/OpenIddict.EntityFramework)** and **[MongoDB](https://www.nuget.org/packages/OpenIddict.MongoDb)**
out-of-the-box and custom stores can be implemented to support other providers.

# Getting started

**Developers looking for a simple and turnkey solution are strongly encouraged to use [OrchardCore and its OpenID module](https://docs.orchardcore.net/en/latest/docs/reference/modules/OpenId/)**,
which is based on OpenIddict, comes with sensible defaults and offers a built-in management GUI to easily register OpenID client applications.

**To implement a custom OpenID Connect server using OpenIddict, read [Getting started](guides/getting-started/index.md)**.

**Samples demonstrating how to use OpenIddict with the different OAuth 2.0/OpenID Connect flows**
can be found in the [dedicated repository](https://github.com/openiddict/openiddict-samples).

# Compatibility matrix

| Web framework version | .NET runtime version | OpenIddict 4.x                          | OpenIddict 5.x                          |
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

> [!WARNING]
> **ASP.NET Core 2.1 on .NET Core 2.1, ASP.NET Core 3.1 and 5.0 are no longer supported by Microsoft. While OpenIddict can still be used
> on these platforms thanks to its .NET Standard 2.0 compatibility, users are strongly encouraged to migrate to ASP.NET Core/.NET 6.0**.

> [!NOTE]
> **The following features are not available when targeting .NET Framework 4.6.1**:
>  - X.509 development encryption/signing certificates: calling `AddDevelopmentEncryptionCertificate()` or `AddDevelopmentSigningCertificate()`
> will result in a `PlatformNotSupportedException` being thrown at runtime if no valid development certificate can be found and a new one must be generated.
>  - X.509 ECDSA signing certificates/keys: calling `AddSigningCertificate()` or `AddSigningKey()`
> with an ECDSA certificate/key will always result in a `PlatformNotSupportedException` being thrown at runtime.

# Certification

Unlike many other identity providers, **OpenIddict is not a turnkey solution but a framework that requires writing custom code**
to be operational (typically, at least an authorization controller), making it a poor candidate for the certification program.

While a reference implementation could be submitted as-is, **this wouldn't guarantee that implementations deployed by OpenIddict users would be standard-compliant.**

Instead, **developers are encouraged to execute the conformance tests against their own deployment** once they've implemented their own logic.

> [!TIP]
> The samples repository contains [a dedicated sample](https://github.com/openiddict/openiddict-samples/tree/dev/samples/Contruum/Contruum.Server) specially designed to be used
> with the OpenID Connect Provider Certification tool and demonstrate that OpenIddict can be easily used in a certified implementation. To allow executing the certification tests
> as fast as possible, that sample doesn't include any membership or consent feature (two hardcoded identities are proposed for tests that require switching between identities).

# Security policy

Security issues and bugs should be reported privately by emailing security@openiddict.com.
You should receive a response within 24 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

# Support

If you need support, please make sure you [sponsor the project](https://github.com/sponsors/kevinchalet) before creating a GitHub ticket.
If you're not a sponsor, you can post your questions on Gitter or StackOverflow:

- **Gitter: [https://app.gitter.im/#/room/#openiddict_openiddict-core:gitter.im](https://app.gitter.im/#/room/#openiddict_openiddict-core:gitter.im)**
- **StackOverflow: [https://stackoverflow.com/questions/tagged/openiddict](https://stackoverflow.com/questions/tagged/openiddict)**

> [!IMPORTANT]
> With OpenIddict 5.0 now being generally available, the previous version, OpenIddict 4.0, stops being supported and won't receive bug
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

# Nightly builds

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

# Contributors

**OpenIddict** is actively maintained by **[Kévin Chalet](https://github.com/kevinchalet)**. Contributions are welcome and can be submitted using pull requests.

**Special thanks to [our sponsors](https://github.com/sponsors/kevinchalet#sponsors) for their incredible support**:

<a href="https://volosoft.com/">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://volosoft.com/assets/logos/volosoft-logo-light.svg">
    <img src="https://volosoft.com/assets/logos/volosoft-logo-dark.svg" width="500px" alt="Volosoft logo" />
  </picture>
</a>

<br />
<br />

<div id="sponsors">
<!-- sponsors --><a href="https://github.com/sebastienros"><img src="https://github.com/sebastienros.png" width="60px" alt="Sébastien Ros" /></a><a href="https://github.com/schmitch"><img src="https://github.com/schmitch.png" width="60px" alt="Schmitt Christian" /></a><a href="https://github.com/cryo75"><img src="https://github.com/cryo75.png" width="60px" alt="" /></a><a href="https://github.com/florianwachs"><img src="https://github.com/florianwachs.png" width="60px" alt="Florian Wachs" /></a><a href="https://github.com/SebastianStehle"><img src="https://github.com/SebastianStehle.png" width="60px" alt="Sebastian Stehle" /></a><a href="https://github.com/communicatie-cockpit"><img src="https://github.com/communicatie-cockpit.png" width="60px" alt="Communicatie Cockpit" /></a><a href="https://github.com/KeithT"><img src="https://github.com/KeithT.png" width="60px" alt="" /></a><a href="https://github.com/Skrypt"><img src="https://github.com/Skrypt.png" width="60px" alt="Jasmin Savard" /></a><a href="https://github.com/ThomasBjallas"><img src="https://github.com/ThomasBjallas.png" width="60px" alt="Thomas" /></a><a href="https://github.com/jonmartinsson"><img src="https://github.com/jonmartinsson.png" width="60px" alt="" /></a><a href="https://github.com/DigitalOpsDev"><img src="https://github.com/DigitalOpsDev.png" width="60px" alt="DigitalOps Co. Ltd." /></a><a href="https://github.com/EYERIDE-Fleet-Management-System"><img src="https://github.com/EYERIDE-Fleet-Management-System.png" width="60px" alt="EYERIDE Fleet Management System" /></a><a href="https://github.com/hypdeb"><img src="https://github.com/hypdeb.png" width="60px" alt="Julien Debache" /></a><a href="https://github.com/StanlyLife"><img src="https://github.com/StanlyLife.png" width="60px" alt="Stian Håve" /></a><a href="https://github.com/ravindUwU"><img src="https://github.com/ravindUwU.png" width="60px" alt="Ravindu Liyanapathirana" /></a><a href="https://github.com/dlandi"><img src="https://github.com/dlandi.png" width="60px" alt="HieronymusBlaze" /></a><a href="https://github.com/ahanoff"><img src="https://github.com/ahanoff.png" width="60px" alt="Akhan Zhakiyanov" /></a><a href="https://github.com/blowdart"><img src="https://github.com/blowdart.png" width="60px" alt="Barry Dorrans" /></a><a href="https://github.com/devqsrl"><img src="https://github.com/devqsrl.png" width="60px" alt="DevQ S.r.l." /></a><a href="https://github.com/dgxhubbard"><img src="https://github.com/dgxhubbard.png" width="60px" alt="" /></a><a href="https://github.com/verdie-g"><img src="https://github.com/verdie-g.png" width="60px" alt="Grégoire" /></a><a href="https://github.com/neil-timmerman"><img src="https://github.com/neil-timmerman.png" width="60px" alt="" /></a><a href="https://github.com/forterro"><img src="https://github.com/forterro.png" width="60px" alt="Forterro" /></a><a href="https://github.com/MarcelMalik"><img src="https://github.com/MarcelMalik.png" width="60px" alt="Marcel" /></a><a href="https://github.com/expeo"><img src="https://github.com/expeo.png" width="60px" alt="" /></a><a href="https://github.com/jwillmer"><img src="https://github.com/jwillmer.png" width="60px" alt="Jens Willmer" /></a><a href="https://github.com/craaash80"><img src="https://github.com/craaash80.png" width="60px" alt="" /></a><a href="https://github.com/BlauhausTechnology"><img src="https://github.com/BlauhausTechnology.png" width="60px" alt="Blauhaus Technology (Pty) Ltd" /></a><a href="https://github.com/trejjam"><img src="https://github.com/trejjam.png" width="60px" alt="Jan Trejbal" /></a><a href="https://github.com/aviationexam"><img src="https://github.com/aviationexam.png" width="60px" alt="Aviationexam s.r.o." /></a><a href="https://github.com/monofor"><img src="https://github.com/monofor.png" width="60px" alt="Monofor" /></a><a href="https://github.com/ratiodata-se"><img src="https://github.com/ratiodata-se.png" width="60px" alt="Ratiodata SE" /></a><a href="https://github.com/DennisvanZetten"><img src="https://github.com/DennisvanZetten.png" width="60px" alt="Dennis van Zetten" /></a><a href="https://github.com/jeroenbai"><img src="https://github.com/jeroenbai.png" width="60px" alt="Jeroen" /></a><a href="https://github.com/Elfster"><img src="https://github.com/Elfster.png" width="60px" alt="Elfster" /></a><a href="https://github.com/Lombiq"><img src="https://github.com/Lombiq.png" width="60px" alt="Lombiq Technologies Ltd." /></a><a href="https://github.com/pureblazor"><img src="https://github.com/pureblazor.png" width="60px" alt="PureBlazor" /></a><a href="https://github.com/HabardiT"><img src="https://github.com/HabardiT.png" width="60px" alt="" /></a><a href="https://github.com/AndrewBabbitt97"><img src="https://github.com/AndrewBabbitt97.png" width="60px" alt="Andrew Babbitt" /></a><a href="https://github.com/stevenkuhn"><img src="https://github.com/stevenkuhn.png" width="60px" alt="Steven Kuhn" /></a><a href="https://github.com/karlschriek"><img src="https://github.com/karlschriek.png" width="60px" alt="Karl Schriek" /></a><a href="https://github.com/softawaregmbh"><img src="https://github.com/softawaregmbh.png" width="60px" alt="softaware gmbh" /></a><a href="https://github.com/dulibanarkadiusz"><img src="https://github.com/dulibanarkadiusz.png" width="60px" alt="" /></a><a href="https://github.com/keshavkaul"><img src="https://github.com/keshavkaul.png" width="60px" alt="Keshav Kaul" /></a><a href="https://github.com/WilhelmJP"><img src="https://github.com/WilhelmJP.png" width="60px" alt="Wilhelm Paßmann" /></a><a href="https://github.com/SingularSystems"><img src="https://github.com/SingularSystems.png" width="60px" alt="Singular Systems" /></a><a href="https://github.com/SCP-srl"><img src="https://github.com/SCP-srl.png" width="60px" alt="SCP-srl" /></a><!-- sponsors -->
</div>

# License

This project is licensed under the **Apache License**. This means that you can use, modify and distribute it freely.
See [http://www.apache.org/licenses/LICENSE-2.0.html](http://www.apache.org/licenses/LICENSE-2.0.html) for more details.

<style>
  #sponsors img {
    display: inline
  }
</style>
