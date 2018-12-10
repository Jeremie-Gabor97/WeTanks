import { disconnect } from 'cluster';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as io from 'socket.io-client';
import { SocketEvent } from '../contracts/socketContract';
import { ScreenType } from './app';
import { Player } from './app';

import './mainScreen.css';

export interface IMainScreenProps {
    player: Player;
    switchScreen: (type: ScreenType) => void;
}

@observer
class MainScreen extends React.Component<IMainScreenProps> {
    @observable disconnected: boolean = false;

    attachSocketListeners() {
        // TODO
    }

    onClickPlay1Player = () => {
        this.props.player.numberOfPlayers = 1;
        this.props.switchScreen(ScreenType.Game);
    }

    onClickPlay2Players = () => {
        this.props.player.numberOfPlayers = 2;
        this.props.switchScreen(ScreenType.Game);
    }

    public render() {
        return (
            <div className={'mainScreen'}>
                <div className={'MainScreen-title'}>
                    {'We Tanks'}
                </div>
                <div className={'MainScreen-playButtonContainer1Player'} onClick={this.onClickPlay1Player}>
                    <span className={'MainScreen-playButton1Player button'}>
                        {'Play: 1 Player'}
                    </span>
                </div>
                <div className={'MainScreen-playButtonContainer2Players'} onClick={this.onClickPlay2Players}>
                    <span className={'MainScreen-playButton2Players button'}>
                        {'Play: 2 Players'}
                    </span>
                </div>
            </div>
        );
    }
}

export default MainScreen;
