import { disconnect } from 'cluster';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as io from 'socket.io-client';

import { ScreenType } from './app';
import GameCanvas from './gameCanvas';
import './gameScreen.css';

export interface IGameScreenProps {
    switchScreen: (type: ScreenType) => void;
}

@observer
class GameScreen extends React.Component<IGameScreenProps> {
    canvas: HTMLCanvasElement | null;
    gameCanvas: GameCanvas;

    componentDidMount() {
        this.attachSocketListeners();
        this.gameCanvas = new GameCanvas(this.canvas);
    }

    componentWillUnmount() {
        this.removeSocketListeners();
        // this.gameCanvas.willUnmount();
        // window.removeEventListener('keyup', this.onWindowKeyUp);
    }

    attachSocketListeners() {
        // this.props.socket.on(SocketEvent.LobbyUpdate, this.onLobbyUpdate);
        // this.props.socket.on(SocketEvent.ReceiveChat, this.onReceiveChat);
    }

    removeSocketListeners() {
        // this.props.socket.removeEventListener(SocketEvent.LobbyUpdate, this.onLobbyUpdate);
        // this.props.socket.removeEventListener(SocketEvent.ReceiveChat, this.onReceiveChat);
    }

    public render() {
        return (
            <div className={'GameScreen noFocus'}>
                <canvas
                    ref={x => { this.canvas = x; }}
                    width={600}
                    height={480}
                    className={'GameScreen-canvas'}
                >
                    {'Canvas not supported in your browser'}
                </canvas>
            </div>
        );
    }
}

export default GameScreen;