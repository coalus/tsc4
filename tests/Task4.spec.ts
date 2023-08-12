import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { beginCell, Cell, toNano } from 'ton-core';
import { Task4 } from '../wrappers/Task4';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Task4', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task4');
    });

    let blockchain: Blockchain;
    let task4: SandboxContract<Task4>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        task4 = blockchain.openContract(Task4.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task4.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task4.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        const text = beginCell();
        text.storeUint(0, 32);
        text.storeStringTail("dDdCVG;&&&&----0");
        let res = await blockchain.runGetMethod(task4.address, 'caesar_cipher_decrypt', [{type: 'int', value: 3n}, {type: 'cell', cell: text.endCell()}]);
        expect(res.stackReader.readString().slice(4)).toEqual("aAaZSD;&&&&----0")
        // the check is done inside beforeEach
        // blockchain and task4 are ready to use
    });
});
