@echo off
rem cmd.exe on this machine has NoDefaultCurrentDirectoryInExePath set, so it
rem won't find gradlew.bat by searching the current directory. React Native's
rem CLI invokes it as a bare command (no ".\"), so we add the android folder
rem to PATH ourselves. This must happen as separate batch lines, not chained
rem with "&&" on one line, or cmd fails to resolve the .bat afterwards.
cd /d %~dp0..\android
set PATH=%PATH%;%CD%
cd /d %~dp0..
set PATH=%PATH%;%CD%\node_modules\.bin
react-native run-android --no-packager
