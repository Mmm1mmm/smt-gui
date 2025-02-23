import path from 'path';
import SeleniumHelper from '../helpers/selenium-helper';

const {
    clickText,
    clickXpath,
    findByText,
    findByXpath,
    getDriver,
    getLogs,
    loadUri,
    notExistsByXpath,
    scope
} = new SeleniumHelper();

const uri = path.resolve(__dirname, '../../build/index.html');

let driver;

const FILE_MENU_XPATH = '//div[contains(@class, "menu-bar_menu-bar-item")]' +
    '[*[contains(@class, "menu-bar_collapsible-label")]//*[text()="File"]]';

describe('Loading scratch gui', () => {
    beforeAll(() => {
        driver = getDriver();
    });

    afterAll(async () => {
        await driver.quit();
    });

    describe('Loading projects by ID', () => {

        test('Nonexistent projects show error screen', async () => {
            await loadUri(`${uri}#999999999999999999999`);
            await clickText('Oops! Something went wrong.');
        });

        // skipping because it relies on network speed, and tests a method
        // of loading projects that we are not actively using anymore
        test.skip('Load a project by ID directly through url', async () => {
            await driver.quit(); // Reset driver to test hitting # url directly
            driver = getDriver();

            const projectId = '96708228';
            await loadUri(`${uri}#${projectId}`);
            await clickXpath('//img[@title="Go"]');
            await new Promise(resolve => setTimeout(resolve, 2000));
            await clickXpath('//img[@title="Stop"]');
            const logs = await getLogs();
            await expect(logs).toEqual([]);
        });

        // skipping because it relies on network speed, and tests a method
        // of loading projects that we are not actively using anymore
        test.skip('Load a project by ID (fullscreen)', async () => {
            await driver.quit(); // Reset driver to test hitting # url directly
            driver = getDriver();

            const prevSize = driver.manage()
                .window()
                .getSize();
            await new Promise(resolve => setTimeout(resolve, 2000));
            driver.manage()
                .window()
                .setSize(1920, 1080);
            const projectId = '96708228';
            await loadUri(`${uri}#${projectId}`);
            await clickXpath('//img[@title="Full Screen Control"]');
            await new Promise(resolve => setTimeout(resolve, 500));
            await clickXpath('//img[@title="Go"]');
            await new Promise(resolve => setTimeout(resolve, 1000));
            await clickXpath('//img[@title="Stop"]');
            prevSize.then(value => {
                driver.manage()
                    .window()
                    .setSize(value.width, value.height);
            });
            const logs = await getLogs();
            await expect(logs).toEqual([]);
        });

        test('Creating new project resets active tab to Code tab', async () => {
            await loadUri(uri);
            await notExistsByXpath('//*[div[contains(@class, "loader_background")]]');
            await findByXpath('//*[span[text()="Costumes"]]');
            await clickText('Costumes');
            await clickXpath(FILE_MENU_XPATH);
            await clickXpath('//li[span[text()="New"]]');
            await notExistsByXpath('//*[div[contains(@class, "loader_background")]]');
            await findByXpath('//div[@class="scratchCategoryMenu"]');
            await clickText('Operators', scope.blocksTab);
        });

        test('Not logged in->made no changes to project->create new project should not show alert', async () => {
            await loadUri(uri);
            await notExistsByXpath('//*[div[contains(@class, "loader_background")]]');
            await clickXpath(FILE_MENU_XPATH);
            await clickXpath('//li[span[text()="New"]]');
            await notExistsByXpath('//*[div[contains(@class, "loader_background")]]');
            await findByXpath('//*[div[@class="scratchCategoryMenu"]]');
            await clickText('Operators', scope.blocksTab);
        });

        test('Not logged in->made a change to project->create new project should show alert', async () => {
            await loadUri(uri);
            await notExistsByXpath('//*[div[contains(@class, "loader_background")]]');
            await clickText('Sounds');
            await clickXpath('//button[@aria-label="Choose a Sound"]');
            await clickText('A Bass', scope.modal); // Should close the modal
            await findByText('1.28'); // length of A Bass sound
            await clickXpath(FILE_MENU_XPATH);
            await clickXpath('//li[span[text()="New"]]');
            driver.switchTo()
                .alert()
                .accept();
            await notExistsByXpath('//*[div[contains(@class, "loader_background")]]');
            await findByXpath('//*[div[@class="scratchCategoryMenu"]]');
            await clickText('Operators', scope.blocksTab);
        });
    });
});
