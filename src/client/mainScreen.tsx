import { disconnect } from 'cluster';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as io from 'socket.io-client';
import { ScreenType } from './app';

import './mainScreen.css';

export interface IMainScreenProps {
    socket: SocketIOClient.Socket;
    switchScreen: (type: ScreenType) => void;
}

@observer
export default class MainScreen extends React.Component<IMainScreenProps> {
    @observable disconnected: boolean = false;
    socket: SocketIOClient.Socket;

    onClickPlay = () => {
        // TODO
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
