import { configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { enableFetchMocks } from 'jest-fetch-mock';
enableFetchMocks();
configure({ adapter: new Adapter() });
