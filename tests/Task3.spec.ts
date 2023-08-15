import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { beginCell, Builder, Cell, toNano } from 'ton-core';
import { Task3 } from '../wrappers/Task3';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';
import { output, input } from '../out'

// thx to @researcher
const fillCell = (bitstrs: string[]) => {
    let builders: Builder[] = [];
    let b: Builder = new Builder();

    for (let bstr of bitstrs) {
        for (let i = 0; i < bstr.length; i++) {
            b = b.storeBit(parseInt(bstr[i]));
        }
        builders.push(b);
        b = new Builder();
    }

    for (let i = builders.length - 1; i > 0; i--) {
        builders[i - 1] = builders[i - 1].storeRef(builders[i].endCell());
    }
    return builders[0].endCell();
};

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
        const c = fillCell(input);
        const res = await blockchain.runGetMethod(task3.address, 'find_and_replace', [{type: 'int', value: 0b101010101010010101010101010101010101010101010101011010101101011010001001010101001010101000100101011111010101010101011010101010110100000101100010101011111n}, {type: 'int', value: 100n}, {type: 'cell', cell: c}]);
        let a = res.stackReader.readCell().beginParse();
        let i = '';
        while (a.remainingBits != 0) {
            i += Number(a.loadBit()).toString();
        }

        while (a.remainingRefs != 0) {
            a = a.loadRef().beginParse()
            while (a.remainingBits != 0) {
                i += Number(a.loadBit()).toString();
            }
        }
        expect(i).toEqual(output)
    });
});
