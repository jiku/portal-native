import { NativeRouter, createMemoryHistory } from 'react-router-native'
import { Asset, FileSystem } from 'expo'

const apollo = () => {
	return {
		clientState: {
			defaults: {
				connection: {
					__typename: `Connection`,
					online: true,
					latency: 0
				},
				user: {
					__typename: `User`,
					authorization: 0,
					location: `/`
				},
				settings: [
					{
						__typename: `Switch`,
						id: `animate`,
						value: true
					}
				]
			},
			resolvers: {
				Query: {
					connection: (_, __, { cache }) => {
						const { connection } = cache.readQuery({ query: GET_CONNECTION })
						return `connection? ${connection}`
					},
					projects: (_, __, { cache }) => {
						try {
							const projects = require('./assets/json/Projects.json')
							return projects.map(x => Object.assign(x, { __typename: `Project` }))
						} catch(e) { console.log(e) }
					},
					routes: (_, __, { cache }) => {
						try {
							const routes = require('./assets/json/Routes.json')
							return routes.map(x => Object.assign({ component: null, data: null }, x, { __typename: `Route` }))
						} catch(e) { console.log(e) }
					},
					menu: (_, __, { cache }) => {
						try {
							const menu = require('./assets/json/Menu.json')
							return menu.map(x => Object.assign(x, { __typename: `Menu` }))
						} catch(e) { console.log(e) }
					},
					parser: async (_, __, { cache }) => {
						try {
							const markdownInfo = await Asset.fromModule(require(`./assets/markdown/Sweetie.md`))
							const markdown = await Expo.FileSystem.readAsStringAsync(markdownInfo.localUri)
							return { __typename: `Markdown`, markdown }
						} catch(e) { console.log(e) }
					},
				},
				Mutation: {
					setConnection: (_, connection, { cache }) => {
						cache.writeData({
							data: {
								connection: {
									__typename: `Connection`,
									online: connection.online
								}
							}
						})
						return null
					},
					setSetting: (_, { setting }, { cache }) => {
						cache.writeData({
							data: {
								settings: [
									setting
								]
							}
						})
						return null
					},
					setUser: (_, user, { cache }) => {
						const data = {
							user: {
								__typename: `User`,
								location: user.location
							}
						}
						cache.writeData({ data })
						return null
					}
				}
			}
		}
	}
}

export const params = {
	context: {
		Router: NativeRouter
	},
	configuration: {
		apollo
	}
}