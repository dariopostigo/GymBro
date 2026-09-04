import React from 'react';
import { Easing } from 'react-native';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import MainTabBar from '../components/MainTabBar';
import HomeScreen from '../screens/HomeScreen';
import TodayScreen from '../screens/TodayScreen';
import SplitOverviewScreen from '../screens/SplitOverviewScreen';
import ProgressScreen from '../screens/ProgressScreen';
import type { MainTabParamList } from './types';
import { colors } from '../theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

const renderTabBar = (props: BottomTabBarProps) => <MainTabBar {...props} />;

export default function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        // Las pantallas se desplazan al cambiar de pestaña en vez de saltar.
        animation: 'shift',
        transitionSpec: {
          animation: 'timing',
          config: { duration: 220, easing: Easing.out(Easing.cubic) },
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
      <Tab.Screen name="Today" component={TodayScreen} options={{ title: 'Hoy' }} />
      <Tab.Screen name="Routine" component={SplitOverviewScreen} options={{ title: 'Rutina' }} />
      <Tab.Screen name="Progress" component={ProgressScreen} options={{ title: 'Progreso' }} />
    </Tab.Navigator>
  );
}
