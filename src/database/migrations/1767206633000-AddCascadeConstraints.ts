import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCascadeConstraints1767206633000 implements MigrationInterface {
  name = 'AddCascadeConstraints1767206633000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "cultivos" DROP CONSTRAINT "FK_e24a025aa7165709fecf80bf0a4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cultivos" DROP CONSTRAINT "FK_a802edf875d91f2f94002159550"`,
    );
    await queryRunner.query(
      `ALTER TABLE "safras" DROP CONSTRAINT "FK_842c3c1f26d1cbc094c853c3b53"`,
    );

    // Recreate foreign key constraints with CASCADE delete
    await queryRunner.query(
      `ALTER TABLE "cultivos" ADD CONSTRAINT "FK_e24a025aa7165709fecf80bf0a4" FOREIGN KEY ("propriedade_rural_id") REFERENCES "propriedades_rurais"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cultivos" ADD CONSTRAINT "FK_a802edf875d91f2f94002159550" FOREIGN KEY ("safra_id") REFERENCES "safras"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "safras" ADD CONSTRAINT "FK_842c3c1f26d1cbc094c853c3b53" FOREIGN KEY ("propriedade_rural_id") REFERENCES "propriedades_rurais"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop CASCADE constraints
    await queryRunner.query(
      `ALTER TABLE "cultivos" DROP CONSTRAINT "FK_e24a025aa7165709fecf80bf0a4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cultivos" DROP CONSTRAINT "FK_a802edf875d91f2f94002159550"`,
    );
    await queryRunner.query(
      `ALTER TABLE "safras" DROP CONSTRAINT "FK_842c3c1f26d1cbc094c853c3b53"`,
    );

    // Recreate original constraints without CASCADE
    await queryRunner.query(
      `ALTER TABLE "cultivos" ADD CONSTRAINT "FK_e24a025aa7165709fecf80bf0a4" FOREIGN KEY ("propriedade_rural_id") REFERENCES "propriedades_rurais"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cultivos" ADD CONSTRAINT "FK_a802edf875d91f2f94002159550" FOREIGN KEY ("safra_id") REFERENCES "safras"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "safras" ADD CONSTRAINT "FK_842c3c1f26d1cbc094c853c3b53" FOREIGN KEY ("propriedade_rural_id") REFERENCES "propriedades_rurais"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
