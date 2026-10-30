import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useWeightStacks } from '../context/WeightStacksContext';
import { resolveStack } from '../storage/weightStackStorage';
import { formatWeight } from '../utils/progression';
import {
  describeStack,
  parseWeightList,
  stackWeights,
  type WeightStack,
} from '../utils/weightStack';
import { Card, Chip, GhostButton, Overline, PrimaryButton } from './ui';
import { colors, overline, radius, spacing } from '../theme';

type Kind = WeightStack['kind'];

const parseNumber = (text: string) => parseFloat(text.replace(',', '.'));

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (text: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="decimal-pad"
        placeholder="kg"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
    </View>
  );
}

/**
 * Pesos reales de la máquina de un ejercicio: con ellos, la sugerencia de subir
 * peso va al siguiente que existe y en Hoy el peso sube y baja por la pila.
 */
export default function WeightStackCard({ exerciseId }: { exerciseId: number }) {
  const { getStack, setStack } = useWeightStacks();
  const { stack: current, source } = getStack(exerciseId);
  // Si el ejercicio trae pesos por defecto, se puede volver a ellos tras cambiarlos.
  const hasDefault = resolveStack({}, exerciseId).source === 'default';
  const [editing, setEditing] = useState(false);
  const [kind, setKind] = useState<Kind>(current?.kind ?? 'steps');
  const [start, setStart] = useState(current?.kind === 'steps' ? formatWeight(current.start) : '5');
  const [step, setStep] = useState(current?.kind === 'steps' ? formatWeight(current.step) : '5');
  const [max, setMax] = useState(current?.kind === 'steps' ? formatWeight(current.max) : '100');
  const [list, setList] = useState(
    current?.kind === 'list' ? current.weights.map(formatWeight).join(' ') : '',
  );

  const draft: WeightStack =
    kind === 'steps'
      ? { kind, start: parseNumber(start), step: parseNumber(step), max: parseNumber(max) }
      : { kind, weights: parseWeightList(list) };
  const draftWeights = stackWeights(draft);

  // Al abrir el editor se parte de la pila que vale ahora (puede haber cambiado).
  const openEditor = () => {
    setKind(current?.kind ?? 'steps');
    if (current?.kind === 'steps') {
      setStart(formatWeight(current.start));
      setStep(formatWeight(current.step));
      setMax(formatWeight(current.max));
    }
    if (current?.kind === 'list') setList(current.weights.map(formatWeight).join(' '));
    setEditing(true);
  };

  const apply = (stack: WeightStack | null | undefined) => {
    setStack(exerciseId, stack);
    setEditing(false);
  };

  const summary = {
    custom: current ? describeStack(current) : '',
    default: current
      ? `${describeStack(current)} · por defecto (aproximado): cámbialo si tu máquina es distinta.`
      : '',
    none: hasDefault
      ? 'Sin pesos: has indicado que esta máquina no tiene pila.'
      : 'Sin configurar. Si guardas los pesos que tiene la máquina (o tu juego de mancuernas), la app solo te sugerirá pesos que existen.',
  }[source];

  return (
    <Card style={styles.card}>
      <Overline>Pesos de la máquina</Overline>

      {!editing ? (
        <>
          <Text style={source === 'custom' ? styles.summary : styles.hint}>{summary}</Text>
          <GhostButton
            label={current ? 'Cambiar pesos' : 'Configurar pesos'}
            onPress={openEditor}
          />
          {source === 'default' && (
            <GhostButton label="Esta máquina no tiene pila de pesos" onPress={() => apply(null)} />
          )}
          {source !== 'default' && hasDefault && (
            <GhostButton label="Volver a los de por defecto" onPress={() => apply(undefined)} />
          )}
        </>
      ) : (
        <>
          <View style={styles.kinds}>
            <Chip label="Saltos fijos" active={kind === 'steps'} onPress={() => setKind('steps')} />
            <Chip label="Lista a mano" active={kind === 'list'} onPress={() => setKind('list')} />
          </View>

          {kind === 'steps' ? (
            <View style={styles.fields}>
              <NumberField label="Desde" value={start} onChange={setStart} />
              <NumberField label="Salto" value={step} onChange={setStep} />
              <NumberField label="Hasta" value={max} onChange={setMax} />
            </View>
          ) : (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Pesos separados por espacios</Text>
              <TextInput
                value={list}
                onChangeText={setList}
                placeholder="4,5 9 13,5 18 22,5"
                placeholderTextColor={colors.muted}
                multiline
                style={[styles.input, styles.listInput]}
              />
            </View>
          )}

          <Text style={draftWeights.length ? styles.summary : styles.error}>
            {draftWeights.length
              ? describeStack(draft)
              : 'Revisa los pesos: no sale ninguno válido.'}
          </Text>

          <View style={styles.actions}>
            <GhostButton label="Cancelar" onPress={() => setEditing(false)} style={styles.action} />
            {source === 'custom' && !hasDefault && (
              <GhostButton label="Quitar" onPress={() => apply(undefined)} style={styles.action} />
            )}
          </View>
          <PrimaryButton
            label="Guardar pesos"
            onPress={() => apply(draft)}
            disabled={draftWeights.length === 0}
          />
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  summary: { color: colors.text, fontSize: 14, fontWeight: '700' },
  hint: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  error: { color: colors.danger, fontSize: 13, fontWeight: '700' },
  kinds: { flexDirection: 'row', gap: spacing.sm },
  fields: { flexDirection: 'row', gap: spacing.sm },
  field: { flex: 1, gap: 4 },
  fieldLabel: { ...overline, fontSize: 9.5, color: colors.muted, marginLeft: 2 },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  listInput: { minHeight: 64, textAlignVertical: 'top' },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1 },
});
