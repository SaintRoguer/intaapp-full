//@ts-check
import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {
  withAlertService,
  withFirebase,
  Tabs,
  GridWithNewButton,
  ImagesTaken,
  BottomRightButton,
  Info,
  withImageHandler,
  DocRefContextProvider,
} from '../../shared';
import {NavDeleteButton} from '../../shared/components/NavDeleteButton';
import {useFocusEffect} from '@react-navigation/native';

function LoteDetails({
  firebaseService: firebase,
  alertService: alerts,
  navigation,
  route,
  imageHandler,
}) {
  const [images, setImages] = useState([]);
  const [pasturas, setPasturas] = useState([]);
  const [itemDetail, setItemDetail] = useState();
  const {item} = route.params;
  const [docRef, setDocRef] = useState();

  useFocusEffect(
    React.useCallback(() => {
      firebase
        .getDocRefInnerId('lotesDetails', item.id)
        .then(({docRef, data}) => {
          setItemDetail(data);
          setImages(data.images);
          setPasturas(data.pasturas);
          setDocRef(docRef);
        });
      return () => {};
    }, [item.id]),
  );

  const routeWithImage = picker => async () => {
    const imageResponse = await imageHandler.pickImage({docRef})(picker);
    navigation.navigate('Imagen', imageResponse);
  };
  const noop = () => {};

  navigation.setOptions({
    title: 'Detalles del lote',
    headerRight: () => (
      <NavDeleteButton
        onPress={() => {
          // onDeleteLote(route.params.itemId);
        }}
      />
    ),
  });

  return (
    <DocRefContextProvider docRef={docRef}>
      <View style={styles.detailsContainer}>
        <Info item={itemDetail} />
        <Tabs
          firstTitle="Pasturas"
          secondTitle="Imagenes"
          FirstScreen={() => (
            <GridWithNewButton
              title=""
              newItemText="Nueva pastura"
              data={pasturas}
              onEntryClick={noop}
              onNewClick={noop}
              onDeleteEntry={noop}
            />
          )}
          SecondScreen={() => <ImagesTaken images={images} />}
        />
        <BottomRightButton
          withBackground={true}
          buttons={[
            {
              name: 'upload',
              type: 'FontAwesome5',
              onPress: routeWithImage('Gallery'),
            },
            {
              name: 'camera-retro',
              type: 'FontAwesome5',
              onPress: routeWithImage('Camera'),
            },
          ]}
        />
      </View>
    </DocRefContextProvider>
  );
}

const styles = StyleSheet.create({
  detailsContainer: {
    height: '100%',
  },
  description: {
    fontSize: 21,
    textAlign: 'center',
  },
});

export default withImageHandler(withAlertService(withFirebase(LoteDetails)));
