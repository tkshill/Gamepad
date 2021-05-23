/*

Purpose: Singleton wrapper over the websocket API

Reason:
We noticed an error during development where React's rendering cycle triggered
multiple calls to the websocket creation. While the appropriate use of useEffect
solved the duplication error, it seemed worth ensuring that the application can bever
create more than one connection on the same url
*/

export class WSconnection extends WebSocket {
  //singleton wrapper over WebSocket
  private static instance?: WSconnection
  private static url?: string

  private constructor(url: string) {
    super(url)
  }

  public static getInstance(url: string) {
    if (!this.instance || this.url !== url) {
      this.instance = new WSconnection(url)
      this.url = url
    }

    return this.instance
  }
}
