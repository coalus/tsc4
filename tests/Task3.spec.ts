import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { beginCell, Cell, toNano } from 'ton-core';
import { Task3 } from '../wrappers/Task3';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Task3', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task3');
    });

    let blockchain: Blockchain;
    let task3: SandboxContract<Task3>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        task3 = blockchain.openContract(Task3.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task3.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task3.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        let b = 0b11110001000000100000111010110011111001110011000;
        let c = beginCell()
        console.log(b.toString());
        c.storeRef(beginCell().storeRef(beginCell().storeUint(b, 47).storeRef(beginCell().storeUint(b, 47).endCell())))
        console.log(c);
        const res = await blockchain.runGetMethod(task3.address, 'find_and_replace', [{type: 'int', value: 10n}, {type: 'int', value: 1n}, {type: 'cell', cell: c.endCell()}]);
        console.log(res.gasUsed);
        const a = res.stackReader.readCell().beginParse();
        console.log(a); 
        let i = '';
        while (a.remainingBits != 0) {
            i += Number(a.loadBit()).toString();
        }
        console.log(i);
    });
});
