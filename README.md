## UC2 - Clinical Supply Chain - csc-workspace-main

## Releases
### UAT_v1 (8.11.2021) (65aea12b57ce8bebc6468b0e3367ccbca838af56)
   In order to install the release commit:
   1. git clone https://github.com/PharmaLedger-IMI/csc-workspace-main.git
   2. cd csc-workspace-main   
   2. git checkout 65aea12b57ce8bebc6468b0e3367ccbca838af56
   3. npm install
   4. npm run server
   5. *In new terminal*: npm run build-all

### Code  Quality
[![DeepScan grade](https://deepscan.io/api/teams/14657/projects/18078/branches/433370/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=14657&pid=18078&bid=433370)

*csc-workspace-main*  bundles all the necessary dependencies for building and running Clinical Supply Chain SSApps in a single package.

[Documentation Page](https://pharmaledger-imi.github.io/csc-workspace-main/)

### Licence

MIT License

Copyright (c) 2021 PharmaLedger Consortium 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

### Running
To run the application launch your browser (preferably Chrome) in Incognito mode and access the http://localhost:8080 link.

You will be present with a menu from where you can choose the SSApp you with to launch

### Installation

In order to use the workspace, we need to follow a list of steps presented below.

* Node v12.

#### Step 1: Clone the workspace

```sh
$ git clone https://github.com/PharmaLedger-IMI/csc-workspace-main.git
```

After the repository was cloned, you must install all the dependencies.

For the latest versions do:
```sh
$ cd csc-workspace-main
#Important: If you plan to contribute to the project and/or dependecies please set DEV:true
#in the file env.json before you run the installation!
$ npm run dev-install
```

For latest 'stable' version do:
```sh
$ npm run install
```
instead.

**Note:** this command might take quite some time depending on your internet connection and you machine processing power.

#### Step 2: Launch the "server"

While in the *csc-workspace-main* folder run:

```sh
$ npm run server
```

#### Step 3: Build all DSUs and anchor them to the 'blockchain'.

Open a new console inside *csc-workspace-main* folder and run:

```sh
# Note: Run this in a new console inside "csc-workspace-main" folder
$ npm run build-all
```

### Documentation

To be able to generate the documentation for this project via

```sh
$ npm run docs
```

[draw.io](https://github.com/jgraph/drawio-desktop/releases) must be installed. Can be also obtained via

```sh
$ snap install drawio
```

in linux

after instalation if not present, add drawio to path

```shell
$ which drawio
```

add a file under ```docs/bin``` called ```drawio_exec_command.os``` containing the command/path to execute drawio

 - Linux:
    ```echo "drawio"```
 - Windows:
    ```echo "${PATH_TO_DRAW_IO}\drawio.exe"```

### Build Mobile
Currently Not Supported

### Courier wallet

TODO

### Clinical Site wallet

Currently Not Supported

#### Build Android APK


Steps

1. Install all dependencies (as develoment) for this workspace
```sh
npm run dev-install
```

2. Bind Android repository into workspace
```sh
npm run install-mobile
```

3. Launch API HUB
```sh
npm run server
```

4. Prepare the Node files that will be packed into the Android app
```sh
#In another tab / console
npm build-mobile
```

5. Have /mobile/scan-app/android/local.properties file with the following content

```sh
# Change the value to your SDK path
sdk.dir=/home/alex/Android/Sdk
```
More on this [here](https://github.com/PrivateSky/android-edge-agent#iv-setup-local-environment-values)

6. Build the APK
```sh
npm build-android-apk
```

This concludes the steps to build the APK file.

**Note:** The .apk file should be in folder
```
mobile/scan-app/android/app/build/outputs/apk/release
```

### Build iOS App

Currently not supported

### Workspace Description
#### pre-install (before running npm install)

* apihub-root: Folder containing the root of what is served by the server
    * external-volume: configs directory;
    * internal-volume: volume folder (brick storage). contains the several configured domains
    * wallet patch folders: the folders contain, in the wallet-patch folder and for each case, the custom 'behaviour' that is added to the template folder:
        * csc-sponsor-wallet/wallet-patch;
        * csc-cmo-wallet/wallet-patch;
        * csc-courier-wallet/wallet-patch;
        * csc-site-wallet/wallet-patch;
* csc-sponsor-wallet
* csc-cmo-wallet
* csc-courier-wallet
* csc-site-wallet
    * Wallets for each one of the actors
* trust-loader-config: custom config to override the wallet loader default ones for each case:
    * csc-sponsor-fabric-wallet/loader;
    * csc-cmo-fabric-wallet/loader;
    * csc-courier-fabric-wallet/loader;
    * csc-site-wallet/loader;

#### post install (after running npm install)

* General use:
    * cardinal: the web framework used for frontend;
    * pharmaledger-wallet: the default wallet implementation to be used by all ssapps - comes from http://github.com/privatesky/menu-wallet-prototype.git
    * node_modules: node modules folder (includes the octopus custom builder)
    * privatesky: the openDSU code. notable folders are:
        * privatesky/modules: all the code for the several modules (openDSU is one of them);
        * privatesky/psknode/bundles: all the code from the previous path, with each module bundled into a single file;
    * themes: the folder with all the installed themes:
        * pharmaledger-theme: custom theme for the pharmaledger implementation comes from https://github.com/PrivateSky/blue-fluorite-theme;
* Use case related:
    * Apihub-root: Folder changes:
        * wallet loaders: clones the loader into each of the wallets:
            * csc-sponsor-fabric-wallet/loader;
            * csc-cmo-fabric-wallet/loader;
            * csc-courier-fabric-wallet/loader;
            * csc-site-wallet/loader;

    * csc-sponsor-ssapp: The application for the sponsor;
    * csc-cmo-ssapp: The application for the contract manufacturing organization;
    * csc-courier-ssapp: The application for the courier;
    * csc-site-ssapp: The application for the clinical site;    




