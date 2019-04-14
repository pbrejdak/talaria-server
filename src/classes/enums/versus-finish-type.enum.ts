export enum VersusFinishType {
    WIN,
    /**
     * one of clients disconnected
     */
    DISCONNECTED,
    /**
     * one of client forfeit race
     */
    FORFEIT,
    /**
     * race was cancelled due to disconnect one of client before race start
     */
    CANCEL,
    /**
     * clients has not connected in 15 sec
     */
    TIMEOUT
}
