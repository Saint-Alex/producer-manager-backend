import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInitialTables1761520597633 implements MigrationInterface {
  name = 'AddInitialTables1761520597633';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "culturas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nome" character varying(100) NOT NULL, "descricao" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_53d8f01eba25b0d50daf730705d" UNIQUE ("nome"), CONSTRAINT "PK_b6e03971235e32ad695a70264fe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "produtores" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cpf_cnpj" character varying(14) NOT NULL, "nome" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_058e0c0465a633c24ea6da81009" UNIQUE ("cpf_cnpj"), CONSTRAINT "PK_6dc732dcaa5cc1ebf885b0370a0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "propriedades_rurais" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nome_fazenda" character varying(255) NOT NULL, "cidade" character varying(100) NOT NULL, "estado" character varying(2) NOT NULL, "area_total" numeric(10,2) NOT NULL, "area_agricultavel" numeric(10,2) NOT NULL, "area_vegetacao" numeric(10,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_af85764b125f482ba91ddf77887" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cultivos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "area_plantada" numeric(10,2), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "propriedade_rural_id" uuid, "safra_id" uuid, "cultura_id" uuid, CONSTRAINT "PK_f7b1d6fc0a6976acd023dca2d3d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "safras" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nome" character varying(100) NOT NULL, "ano" integer NOT NULL, "data_inicio" date, "data_fim" date, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "propriedade_rural_id" uuid, CONSTRAINT "PK_3cb7ebbb540db145b066ef34403" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."audit_logs_action_enum" AS ENUM('CREATE', 'UPDATE', 'DELETE', 'SOFT_DELETE', 'RESTORE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "action" "public"."audit_logs_action_enum" NOT NULL, "entityType" character varying(100) NOT NULL, "entityId" uuid NOT NULL, "userId" uuid, "userIp" character varying(45), "userAgent" text, "correlationId" uuid, "oldData" jsonb, "newData" jsonb, "changedFields" jsonb, "metadata" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id")); COMMENT ON COLUMN "audit_logs"."action" IS 'Tipo de operação realizada'; COMMENT ON COLUMN "audit_logs"."entityType" IS 'Nome da entidade afetada (ex: Producer, Propriedade)'; COMMENT ON COLUMN "audit_logs"."entityId" IS 'ID da entidade afetada'; COMMENT ON COLUMN "audit_logs"."userId" IS 'ID do usuário que realizou a operação'; COMMENT ON COLUMN "audit_logs"."userIp" IS 'IP do usuário'; COMMENT ON COLUMN "audit_logs"."userAgent" IS 'User Agent do navegador'; COMMENT ON COLUMN "audit_logs"."correlationId" IS 'ID de correlação da requisição'; COMMENT ON COLUMN "audit_logs"."oldData" IS 'Dados antes da alteração (para UPDATE e DELETE)'; COMMENT ON COLUMN "audit_logs"."newData" IS 'Dados após a alteração (para CREATE e UPDATE)'; COMMENT ON COLUMN "audit_logs"."changedFields" IS 'Campos que foram alterados (apenas para UPDATE)'; COMMENT ON COLUMN "audit_logs"."metadata" IS 'Informações adicionais ou contexto da operação'; COMMENT ON COLUMN "audit_logs"."createdAt" IS 'Data e hora da operação'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c69efb19bf127c97e6740ad530" ON "audit_logs" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cee5459245f652b75eb2759b4c" ON "audit_logs" ("action") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cfa83f61e4d27a87fcae1e025a" ON "audit_logs" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_13c69424c440a0e765053feb4b" ON "audit_logs" ("entityType", "entityId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "produtor_propriedade" ("propriedade_id" uuid NOT NULL, "produtor_id" uuid NOT NULL, CONSTRAINT "PK_e76c84682b33714cd710b6d1773" PRIMARY KEY ("propriedade_id", "produtor_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b170277014bd09e0d9f3fd6e41" ON "produtor_propriedade" ("propriedade_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_69eee2ed47ace291ec3a9b2b1c" ON "produtor_propriedade" ("produtor_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "cultivos" ADD CONSTRAINT "FK_e24a025aa7165709fecf80bf0a4" FOREIGN KEY ("propriedade_rural_id") REFERENCES "propriedades_rurais"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cultivos" ADD CONSTRAINT "FK_a802edf875d91f2f94002159550" FOREIGN KEY ("safra_id") REFERENCES "safras"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cultivos" ADD CONSTRAINT "FK_9cebe6f7526705afc564d879e21" FOREIGN KEY ("cultura_id") REFERENCES "culturas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "safras" ADD CONSTRAINT "FK_842c3c1f26d1cbc094c853c3b53" FOREIGN KEY ("propriedade_rural_id") REFERENCES "propriedades_rurais"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "produtor_propriedade" ADD CONSTRAINT "FK_b170277014bd09e0d9f3fd6e419" FOREIGN KEY ("propriedade_id") REFERENCES "propriedades_rurais"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "produtor_propriedade" ADD CONSTRAINT "FK_69eee2ed47ace291ec3a9b2b1c3" FOREIGN KEY ("produtor_id") REFERENCES "produtores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "produtor_propriedade" DROP CONSTRAINT "FK_69eee2ed47ace291ec3a9b2b1c3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "produtor_propriedade" DROP CONSTRAINT "FK_b170277014bd09e0d9f3fd6e419"`,
    );
    await queryRunner.query(
      `ALTER TABLE "safras" DROP CONSTRAINT "FK_842c3c1f26d1cbc094c853c3b53"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cultivos" DROP CONSTRAINT "FK_9cebe6f7526705afc564d879e21"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cultivos" DROP CONSTRAINT "FK_a802edf875d91f2f94002159550"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cultivos" DROP CONSTRAINT "FK_e24a025aa7165709fecf80bf0a4"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_69eee2ed47ace291ec3a9b2b1c"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_b170277014bd09e0d9f3fd6e41"`);
    await queryRunner.query(`DROP TABLE "produtor_propriedade"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_13c69424c440a0e765053feb4b"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_cfa83f61e4d27a87fcae1e025a"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_cee5459245f652b75eb2759b4c"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_c69efb19bf127c97e6740ad530"`);
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum"`);
    await queryRunner.query(`DROP TABLE "safras"`);
    await queryRunner.query(`DROP TABLE "cultivos"`);
    await queryRunner.query(`DROP TABLE "propriedades_rurais"`);
    await queryRunner.query(`DROP TABLE "produtores"`);
    await queryRunner.query(`DROP TABLE "culturas"`);
  }
}
