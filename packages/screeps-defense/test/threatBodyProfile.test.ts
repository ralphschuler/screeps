import { expect } from 'chai';
import { summarizeHostileBody } from '../src/threat/bodyThreatProfile';

function hostileWithBody(body: Array<{ type: BodyPartConstant; hits: number; boost?: string }>): Pick<Creep, 'body'> {
  return { body } as Pick<Creep, 'body'>;
}

describe('Threat body profile', () => {
  it('summarizes active body parts into one scoring profile', () => {
    const profile = summarizeHostileBody(hostileWithBody([
      { type: ATTACK, hits: 100 },
      { type: ATTACK, hits: 0 },
      { type: RANGED_ATTACK, hits: 100 },
      { type: HEAL, hits: 100 },
      { type: WORK, hits: 100 },
      { type: MOVE, hits: 100, boost: 'XZHO2' }
    ]));

    expect(profile.attackParts).to.equal(1);
    expect(profile.rangedParts).to.equal(1);
    expect(profile.healParts).to.equal(1);
    expect(profile.workParts).to.equal(1);
    expect(profile.isBoosted).to.equal(true);
    expect(profile.dps).to.equal(90);
    expect(profile.scoreContribution).to.equal(420);
    expect(profile.isMelee).to.equal(true);
    expect(profile.isRanged).to.equal(true);
    expect(profile.isHealer).to.equal(true);
    expect(profile.isDismantler).to.equal(true);
  });

  it('preserves WORK-part threat scoring rollback semantics', () => {
    const singleWork = summarizeHostileBody(hostileWithBody([
      { type: WORK, hits: 100 },
      { type: MOVE, hits: 100 }
    ]), { scoreWorkPartThreats: false });

    expect(singleWork.dps).to.equal(0);
    expect(singleWork.scoreContribution).to.equal(0);
    expect(singleWork.isDismantler).to.equal(false);

    const legacyDismantler = summarizeHostileBody(hostileWithBody([
      { type: WORK, hits: 100 },
      { type: WORK, hits: 100 },
      { type: WORK, hits: 100 },
      { type: WORK, hits: 100 },
      { type: WORK, hits: 100 }
    ]), { scoreWorkPartThreats: false });

    expect(legacyDismantler.dps).to.equal(0);
    expect(legacyDismantler.scoreContribution).to.equal(150);
    expect(legacyDismantler.isDismantler).to.equal(true);
  });
});
