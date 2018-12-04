import { observable } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import * as io from 'socket.io-client';

// import GameLobbyScreen from './gameLobbyScreen';
import GameScreen from './gameScreen';
// import LobbyScreen from './gobbyScreen';
import MainScreen from './mainScreen';
// import RootStore from './stores';

import './app.css';

export enum ScreenType {
    Main,
    Lobby,
    GameLobby,
    Game
}

@observer
class App extends React.Component<{}> {
    @observable disconnected: boolean = false;
    @observable activeScreen: ScreenType = ScreenType.Main;
    // socket: SocketIOClient.Socket;

    constructor(props: {}) {
        super(props);
        // this.socket = io();
    }

    switchScreen = (type: ScreenType) => {
        this.activeScreen = type;
    }

    renderScreen() {
        switch (this.activeScreen) {
            case ScreenType.Main:
                return <MainScreen key={'main'} switchScreen={this.switchScreen} />;
            // case ScreenType.Lobby:
               // return <LobbyScreen key={'lobby'} socket={this.socket} switchScreen={this.switchScreen} />;
            // case ScreenType.GameLobby:
               // return <GameLobbyScreen key={'gameLobby'} socket={this.socket} switchScreen={this.switchScreen} />;
            case ScreenType.Game:
                return <GameScreen key={'game'} switchScreen={this.switchScreen} />;
            default:
                return null;
        }
    }

    public render() {
        return (
            <div className={'App'}>
                <div className={'App-screen'}>
                    {this.disconnected
                        ? (
                            <div className={'App-disconnected'}>
                                {'Disconnected from the server'}
                            </div>
                        )
                        : (this.renderScreen())
                    }
                </div>
            </div >
        );
    }
}

// <img className={'background'} src={'assets/backgrounds/main.jpg'} />
// <ReactCSSTransitionGroup
//                                transitionName={'swag'}
//                                transitionEnterTimeout={1000}
//                                transitionLeaveTimeout={1000}
//                            >
// </ReactCSSTransitionGroup>
export default App;