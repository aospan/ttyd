import { bind } from 'decko';
import { Component, h } from 'preact';
import { Xterm, XtermOptions } from './xterm';

import '@xterm/xterm/css/xterm.css';
import { Modal } from '../modal';

interface Props extends XtermOptions {
    id: string;
}

interface State {
    modal: boolean;
    ctrlActive: boolean;
    altActive: boolean;
    showExtraKeys: boolean;
}

const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

export class Terminal extends Component<Props, State> {
    private container: HTMLElement;
    private xterm: Xterm;

    constructor(props: Props) {
        super();
        this.xterm = new Xterm(props, this.showModal);
        this.state = { modal: false, ctrlActive: false, altActive: false, showExtraKeys: false };
    }

    async componentDidMount() {
        await this.xterm.refreshToken();
        this.xterm.open(this.container);
        this.xterm.connect();
        this.setState({ showExtraKeys: isTouchDevice() });
    }

    componentWillUnmount() {
        this.xterm.dispose();
    }

    render({ id }: Props, { modal, ctrlActive, altActive, showExtraKeys }: State) {
        return (
            <div id={id} class="terminal-wrapper">
                <div class="terminal-main" ref={c => { this.container = c as HTMLElement; }}>
                    <Modal show={modal}>
                        <label class="file-label">
                            <input onChange={this.sendFile} class="file-input" type="file" multiple />
                            <span class="file-cta">Choose files…</span>
                        </label>
                    </Modal>
                </div>
                {showExtraKeys && (
                    <div class="extra-keys">
                        <button class="extra-key" onMouseDown={this.onEsc} onTouchStart={this.onEsc}>Esc</button>
                        <button class="extra-key" onMouseDown={this.onTab} onTouchStart={this.onTab}>Tab</button>
                        <button class={`extra-key ${ctrlActive ? 'active' : ''}`} onMouseDown={this.onCtrl} onTouchStart={this.onCtrl}>Ctrl</button>
                        <button class={`extra-key ${altActive ? 'active' : ''}`} onMouseDown={this.onAlt} onTouchStart={this.onAlt}>Alt</button>
                        <button class="extra-key" onMouseDown={this.onArrowUp} onTouchStart={this.onArrowUp}>↑</button>
                        <button class="extra-key" onMouseDown={this.onArrowDown} onTouchStart={this.onArrowDown}>↓</button>
                        <button class="extra-key" onMouseDown={this.onArrowLeft} onTouchStart={this.onArrowLeft}>←</button>
                        <button class="extra-key" onMouseDown={this.onArrowRight} onTouchStart={this.onArrowRight}>→</button>
                    </div>
                )}
            </div>
        );
    }

    @bind
    showModal() {
        this.setState({ modal: true });
    }

    @bind
    sendFile(event: Event) {
        this.setState({ modal: false });
        const files = (event.target as HTMLInputElement).files;
        if (files) this.xterm.sendFile(files);
    }

    @bind
    onEsc(event: Event) {
        event.preventDefault();
        this.xterm.sendKey('\x1b');
    }

    @bind
    onTab(event: Event) {
        event.preventDefault();
        this.xterm.sendKey('\t');
    }

    @bind
    onCtrl(event: Event) {
        event.preventDefault();
        const active = !this.state.ctrlActive;
        this.setState({ ctrlActive: active });
        if (active) {
            this.xterm.enableModifierMode('ctrl', () => this.setState({ ctrlActive: false }));
        } else {
            this.xterm.disableModifierMode();
        }
    }

    @bind
    onAlt(event: Event) {
        event.preventDefault();
        const active = !this.state.altActive;
        this.setState({ altActive: active });
        if (active) {
            this.xterm.enableModifierMode('alt', () => this.setState({ altActive: false }));
        } else {
            this.xterm.disableModifierMode();
        }
    }

    @bind
    onArrowUp(event: Event) {
        event.preventDefault();
        this.xterm.sendKey('\x1b[A');
    }

    @bind
    onArrowDown(event: Event) {
        event.preventDefault();
        this.xterm.sendKey('\x1b[B');
    }

    @bind
    onArrowLeft(event: Event) {
        event.preventDefault();
        this.xterm.sendKey('\x1b[D');
    }

    @bind
    onArrowRight(event: Event) {
        event.preventDefault();
        this.xterm.sendKey('\x1b[C');
    }
}
