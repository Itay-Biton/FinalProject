import React, {useMemo} from 'react';
import {useWindowDimensions, View} from 'react-native';
import {Card, Button, Text, useTheme} from 'react-native-paper';
import {createStyles} from '../styles/HomeScreenStyles';
import {useTranslation} from 'react-i18next';

export default function HomeScreen() {
  const {t} = useTranslation();
  const {width, height} = useWindowDimensions();
  const {colors} = useTheme();

  // Memoize styles so they update only when width, height, or customTheme change
  const styles = useMemo(
    () => createStyles(width, height, colors),
    [width, height, colors],
  );

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title={t('cardTitle')} subtitle={t('cardSubtitle')} />
        <Card.Content>
          <Text style={styles.text}>{t('cardContent')}</Text>
        </Card.Content>
        <Card.Actions>
          <Button
            mode="contained"
            style={styles.button}
            onPress={() => console.log('Button Pressed')}>
            {t('buttonText')}
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
}
