import { createBoard } from '@wixc3/react-board';
import App from '../../../App';

export default createBoard({
    name: 'App',
    Board: () => <App />,
    environmentProps: {
        windowWidth: 1920,
        windowHeight: 1080,
        canvasWidth: 1968,
        canvasHeight: 1080,
    },
});
