import { params } from './params'
import { App as AppOrigin } from '@jiku/portal'
import React, { Component } from 'react'
import { View, Platform, StatusBar, StyleSheet, Text, Image } from 'react-native'
import { AppLoading, Asset, Font } from 'expo'

const App = () => AppOrigin(params)

export class ExpoContainer extends React.Component {
	state = {
		isLoadingComplete: false,
	}

	_loadResourcesAsync = async () => await Promise.all([
		Font.loadAsync({
			'jikutype-001-Vector': require('./assets/fonts/jikutype-001-Vector.woff2'),
			'awesome': require('./assets/fonts/fa-solid-900.woff2'),
		}),
		Asset.loadAsync([
			require('./assets/images/bg.png'),
			require('./assets/markdown/Sweetie.md'),
		])
	])

	_handleLoadingError = error => console.warn(error)

	_handleFinishLoading = () => this.setState({ isLoadingComplete: true })

	render() {
		if (!this.state.isLoadingComplete) {
			return (
				<AppLoading
					startAsync={this._loadResourcesAsync}
					onError={this._handleLoadingError}
					onFinish={this._handleFinishLoading}
				/>
			)
		} else {
			return (
				<View style={styles.container}>
					{Platform.OS === 'ios' && <StatusBar barStyle="default" />}
					{Platform.OS === 'android' && <View style={styles.statusBarUnderlay} />}
					{App(params)}
				</View>
			)
		}
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	statusBarUnderlay: {
		height: 24,
		backgroundColor: 'rgba(0,0,0,0.2)',
	}
})

export default ExpoContainer