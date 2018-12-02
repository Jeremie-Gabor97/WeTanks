export const SocketEvent = {
    // Shared Events
    SendChat: 'sendChat',
    ReceiveChat: 'receiveChat',
    // Main Events
    ConfirmUsername: 'confirmUsername',
    Login: 'login',
    LoginFailed: 'loginFailed',
    Logout: 'logout',
    // Lobby Events
    LeaveLobby: 'leaveLobby',
    CreateGame: 'createGame',
    JoinGame: 'joinGame',
    JoinFailed: 'joinFailed',
    LobbyUpdate: 'lobbyUpdate',
    ChangeAvatar: 'changeAvatar',
    // GameLobby Events
    StartGame: 'startGame',
    StartingGame: 'startingGame',
    LeaveGameLobby: 'leaveGameLobby',
    SwitchTeam: 'switchTeam',
    GameLobbyUpdate: 'gameLobbyUpdate',
    // GameEvents
    GameUpdate: 'gameUpdate',
    ClickTarget: 'clickTarget'
};