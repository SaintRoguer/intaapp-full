//@ts-check
import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {
  withAlertService,
  withFirebase,
  GridWithNewButton,
  DocRefContextProvider,
} from '../../../shared';
import {SessionHeader} from './SessionHeader';
import {NavDeleteButton} from '../../../shared/components/NavDeleteButton';
import {AlertService} from '../../../shared/services/alertsService';
import {useFocusEffect} from '@react-navigation/native';
import {HeaderBackButton} from '@react-navigation/stack';

function SessionDetails({navigation, route, firebaseService, alertService}) {
  const {item, itemId} = route.params;
  const [lotes, setLotes] = useState([]);
  const [docRef, setDocRef] = useState(null);
  const [refresh, setRefresh] = useState(false);

  const toggleRefresh = () => setRefresh(prev => !prev);

  useFocusEffect(
    React.useCallback(() => {
      async function retrieveDetails() {
        const {docRef, data} = await firebaseService.getDocRefInnerId(
          'sessionsDetails',
          itemId,
        );
        setLotes(data.lotes.reverse() || []);
        setDocRef(docRef);
      }
      retrieveDetails();
      return () => {};
    }, [itemId, refresh]),
  );

  async function onDeleteSession(sessionId) {
    AlertService.getInstance()
      .showConfirmDialog(
        '¡Atención! Se eliminará esta sesión y toda la información asociada a ella. ',
      )
      .then(async () => {
        const collectionDelete = firebaseService
          .getDocRefFromId('sessions', sessionId)
          .delete();
        const detailsDelete = docRef?.delete();
        Promise.all([collectionDelete, detailsDelete]).then(() => {
          navigation.navigate('Main');
        });
      });
  }

  navigation.setOptions({
    title: 'Detalles de la sesión',
    headerLeft: () => (
      <HeaderBackButton
        onPress={() => {
          navigation.navigate('Main');
        }}
      />
    ),
    headerRight: () => (
      <NavDeleteButton
        onPress={() => {
          onDeleteSession(route.params.itemId);
        }}
      />
    ),
  });

  const onDelete = loteId => {
    alertService
      .showConfirmDialog('¡Atención! Se eliminará este lote. ')
      .then(() => {
        firebaseService
          .remove(docRef, 'lotes', 'lotesDetails', loteId)
          .then(toggleRefresh);
      });
  };
  const onNewPress = () => {
    alertService
      .showPromptDialog(
        `Lote ${lotes.length + 1}`,
        'Nombre/Identificador del lote',
      )
      .then(loteName => {
        firebaseService
          .add(
            docRef,
            'lotes',
            'lotesDetails',
            {description: loteName},
            {
              images: [],
              pasturas: [],
              averagePercentages: {},
            },
          )
          .then(toggleRefresh);
      });
  };

  const routeToLote = item => {
    navigation.navigate('LoteDetails', {
      item: item,
    });
  };

  return (
    <DocRefContextProvider docRef={docRef}>
      <View style={styles.viewContainer}>
        <SessionHeader item={item} />
        <GridWithNewButton
          title="Lotes"
          data={lotes}
          onDeleteEntry={onDelete}
          onNewClick={onNewPress}
          onEntryClick={routeToLote}
        />
      </View>
    </DocRefContextProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    width: '100%',
  },
  lotesContainer: {
    flex: 2,
    width: '100%',
    alignItems: 'center',
  },
  lotesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  viewContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonsContainer: {
    flex: 1,
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'space-evenly',
  },
  button: {
    padding: 10,
  },
  buttonText: {
    color: 'white',
  },
  inputContainer: {
    marginTop: 20,
  },
});

export default withAlertService(withFirebase(SessionDetails));
