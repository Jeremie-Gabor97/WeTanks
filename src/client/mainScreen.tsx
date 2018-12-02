import { disconnect } from 'cluster';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as io from 'socket.io-client';
import { SocketEvent } from '../contracts/socketContract';
import { ScreenType } from './app';

import './mainScreen.css';

export interface IMainScreenProps {
    socket: SocketIOClient.Socket;
    switchScreen: (type: ScreenType) => void;
}

@observer
class MainScreen extends React.Component<IMainScreenProps> {
    @observable disconnected: boolean = false;

    onClickPlay = () => {
        this.props.socket.emit(SocketEvent.StartGame);
    }

    public render() {
        return (
            <body>
            <div className={'mainScreen'}>
                <h1>We Tanks</h1>
                <div className={'MainScreen-playButtonContainer'}>
                    <span className={'MainScreen-playButton button'} onClick={this.onClickPlay}>
                        {'Play'}
                    </span>
                </div>
            </div>
            </body>        
        );
    }
}

export default MainScreen;
