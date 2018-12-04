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
    switchScreen: (type: ScreenType) => void;
}

@observer
class MainScreen extends React.Component<IMainScreenProps> {
    @observable disconnected: boolean = false;

    attachSocketListeners() {
        // TODO
    }

    onClickPlay = () => {
        this.props.switchScreen(ScreenType.Game);
    }

    public render() {
        return (
            <div className={'mainScreen'}>
                <h1>We Tanks</h1>
                <div className={'MainScreen-playButtonContainer'} onClick={this.onClickPlay}>
                    <span className={'MainScreen-playButton button'}>
                        {'Play'}
                    </span>
                </div>
            </div>
        );
    }
}

export default MainScreen;
