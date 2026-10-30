/**
 * `npm run android` multiplataforma: en Windows delega en run-android.bat
 * (ver allí por qué hace falta); en Linux/macOS llama a la CLI directamente.
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// El Android Gradle Plugin falla con JDKs muy nuevos (p.ej. jlink de JDK 26 en
// JdkImageTransform). Si hay un JDK 17 instalado, lo usamos para Gradle.
const env = { ...process.env };
const jdk17 = ['/usr/lib/jvm/java-17-openjdk', '/usr/lib/jvm/java-17-openjdk-amd64'].find(p =>
  fs.existsSync(path.join(p, 'bin', 'java')),
);
if (process.platform === 'linux' && jdk17) {
  env.JAVA_HOME = jdk17;
  env.PATH = `${path.join(jdk17, 'bin')}${path.delimiter}${env.PATH}`;
}

// Algunas distros (Manjaro) fijan ANDROID_HOME=/opt/android-sdk en /etc/profile.d
// aunque el SDK de verdad sea otro: manda el de android/local.properties, que es
// el que usa Gradle, para que la CLI encuentre el mismo adb y el emulador.
const localProperties = path.join(__dirname, '..', 'android', 'local.properties');
const sdkDir = fs.existsSync(localProperties)
  ? /^sdk\.dir=(.*)$/m.exec(fs.readFileSync(localProperties, 'utf-8'))?.[1]?.trim()
  : undefined;
if (process.platform !== 'win32' && sdkDir && fs.existsSync(sdkDir)) {
  env.ANDROID_HOME = sdkDir;
  env.ANDROID_SDK_ROOT = sdkDir;
  const tools = ['platform-tools', 'emulator'].map(dir => path.join(sdkDir, dir));
  env.PATH = [...tools, env.PATH].join(path.delimiter);
}

const result =
  process.platform === 'win32'
    ? spawnSync(path.join(__dirname, 'run-android.bat'), { stdio: 'inherit', shell: true })
    : spawnSync('npx', ['react-native', 'run-android', '--no-packager', '--active-arch-only'], {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..'),
        env,
      });

process.exit(result.status ?? 1);
