import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import ts from 'typescript';

test('approval policy and use case have no Angular, UI or transport imports', async () => {
  const file = 'src/app/features/engineering/architecture-examples/approve-order.ts';
  const source = ts.createSourceFile(
    file,
    await readFile(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const dependencies = source.statements
    .filter(ts.isImportDeclaration)
    .map((statement) => statement.moduleSpecifier.text);
  assert.ok(
    dependencies.every((dependency) => dependency.startsWith('./')),
    'The boundary may depend only on local pure policy helpers.',
  );
  assert.equal(source.parseDiagnostics.length, 0);
});
