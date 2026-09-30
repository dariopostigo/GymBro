package com.gymbro.app

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "GymBro"

  /**
   * Android puede destruir la Activity mientras la app está en segundo plano (memoria, "no
   * mantener actividades"...). Al volver intenta restaurar los fragments guardados, pero los de
   * react-native-screens no se pueden restaurar y revientan con IllegalStateException antes de que
   * arranque React. Pasando null descartamos ese estado: la jerarquía de vistas la reconstruye
   * React Native desde cero, que es lo que espera el navegador.
   * https://github.com/software-mansion/react-native-screens/issues/17#issuecomment-424704067
   */
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
  }

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
