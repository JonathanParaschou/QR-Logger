import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Button, TextInput, SafeAreaView, Alert, RefreshControl, ScrollView } from 'react-native';
import AppLoading from 'expo-app-loading';
import { useFonts } from 'expo-font';
import _, { isUndefined, size } from 'lodash';
import QRCode from 'react-native-qrcode-svg';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

var URL = "";
var textHolder = "";
var textHolder2 = "";
var keyIndex = 1;
var arrayIndex = 0;
var URLs = [];
var reloaded = true;
const wait = timeout => {
  return new Promise(resolve => setTimeout(resolve, timeout));
};

const clearAsyncStorage = async() => {
  AsyncStorage.clear();
  console.log("cleared");
}

const storeData = async () => {
  try {
    const jsonValue = JSON.stringify(URLs)
    const jsonValue2 = JSON.stringify(arrayIndex)
    const jsonValue3 = JSON.stringify(keyIndex)
    await AsyncStorage.setItem('data', jsonValue)
    await AsyncStorage.setItem('arrayIndex', jsonValue2)
    await AsyncStorage.setItem('key', jsonValue3)
    console.log(jsonValue + " arrayInd: " + jsonValue2 + " keyInd: " + jsonValue3);
  } catch (e) {
    // saving error
  }
}

const getData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('data')
    const jsonValue2 = await AsyncStorage.getItem('arrayIndex')
    const jsonValue3 = await AsyncStorage.getItem('key')
    console.log(jsonValue+ " arrayInd: " + jsonValue2 + " keyInd: " + jsonValue3);
    if(JSON.parse(jsonValue)!=null){
      URLs = JSON.parse(jsonValue);
      arrayIndex = JSON.parse(jsonValue2)
      keyIndex = JSON.parse(jsonValue3)
    }
    else{
      console.log("failed");
    }
    console.log("Returned");
    console.log(URLs);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch(e) {
    console.log(e);
  }
}

//Starter Screen
function mainScreen({ navigation }) {
  const [qrvalue, setQrvalue] = React.useState("");
  const [input, setInput] = React.useState("");
  useEffect (() => {
    getData();
    //clearAsyncStorage();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <SafeAreaView style={{ marginTop: '10%', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'Outfit', fontSize: 40 }}>QR Code Logger</Text>
        <TextInput
          style={styles.input}
          placeholder="URL"
          onChangeText={(text) => {
            setInput(text);
            URL = text;
          }} 
        />
        <Button
          title="Generate QR Code"
          color="black"
          onPress={() => {
            if (_.isEqual(URL, "")) {
              Alert.alert('Error', 'No Input Detected!');
            }
            else {
              setQrvalue(input);
              console.log(URL);
            }
          } } />
      </SafeAreaView>
      <SafeAreaView style={{ marginTop: '20%' }}>
        <QRCode
          value={qrvalue ? qrvalue : 'NA'}
          size={250} />
      </SafeAreaView>
      <SafeAreaView style={{ marginVertical: '10%', alignContent: 'center' }}>
        <Button
          title="QR Code List"
          color="black"
          onPress={() => navigation.navigate('List')} />
      </SafeAreaView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}


//QR Code List
const listQR = ( {navigation} ) => {
  const [qrvalue, setQrvalue] = React.useState("");
  const [qrs] = React.useState(URLs);
  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(() => {
    reloaded = true;
    setRefreshing(true);
    wait(1000).then(() => setRefreshing(false));}, []);
  
  const removeData = async () => {
    try {
      await AsyncStorage.removeItem('data')
      await AsyncStorage.removeItem('arrayIndex')
      await AsyncStorage.removeItem('keyIndex')
    } catch(e) {
      // remove error
    }
  
    console.log('Done.')
  }

  return(
  <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>} style={{flex: 1, backgroundColor: 'dodgerblue'}}>
    <SafeAreaView style={{alignItems: 'center'}}>
      <Text style={{ fontFamily: 'Outfit', fontSize: 20, marginTop: '10%' }}>Logged QR's</Text>
    </SafeAreaView>
    <SafeAreaView style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <Button
          title='QR Generator'
          color="black"
          onPress={() => navigation.navigate('Home') }
        />
        <Button
          title='Add QR Code'
          color="black"
          onPress={() => navigation.navigate('Data')}
        />
    </SafeAreaView>
    <View style={{justifyContent: 'center', alignItems: 'center'}}>
      {qrs.map((item) => {
        return(
          <TouchableOpacity name={item.name} key={item.key} style={{margin: "10%"}} onPress={() => {
            if(reloaded){  
              Alert.alert("Change QR Code", "What would you like to change?", 
              [{text:"Delete", onPress: () => {
                var tempKey = parseInt(item.key);
                URLs.splice(parseInt(item.key)-1, 1)
                for(var x=0;x<URLs.length;x++){
                  if((x+1)>=tempKey){
                    URLs[x].key = (parseInt(URLs[x].key)-1).toString();
                    URLs = URLs.filter(Boolean);
                    key=URLs[x].key;
                  }
                }
                keyIndex--;
                arrayIndex--;
                storeData();
                reloaded = false;
                //console.log(URLs);
              }}, 
              {text: "Cancel"}])
            }
            else{
              Alert.alert("Error", "Reload the page");
            }
            //console.log(URLs)
            }}>
            <Text style={{justifyContent: 'center', alignItems: 'center'}}>{item.name}</Text>
            <QRCode
              value={qrvalue ? qrvalue : item.url}
              size={250} 
            />
          </TouchableOpacity>
        );
      })}
    </View>
  </ScrollView>
  );
}

//URL Adder Screen
const dataInput = ( {navigation} ) => {
  const [input, setInput] = React.useState("");
  const [data] = React.useState(URLs);
  
  return(
    <SafeAreaView style={styles.container2}>
      <SafeAreaView style={{marginTop: '20%', alignItems: 'center'}}>
        <Text style={{ fontFamily: 'Outfit', fontSize: 20, color: 'white'}}>Enter URL</Text>
        <TextInput 
        style={styles.input2} 
        placeholder="URL" 
        onChangeText={(text) => {
          setInput(text);
          textHolder = text;
        }}
        />
        <Text style={{ fontFamily: 'Outfit', fontSize: 20, color: 'white'}}>Enter Name for QR Code</Text>
        <TextInput 
        style={styles.input2} 
        placeholder="Name" 
        onChangeText={(text) => {
          setInput(text);
          textHolder2 = text;
        }}
        />
      </SafeAreaView>
      <SafeAreaView style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <Button
          title="Add to List"
          color="red"
          onPress={() => {
            if(_.isEqual(textHolder, "", textHolder2)){
              Alert.alert('Error','No Input Detected!');
            }
            else{
              Alert.alert("QR Code Generated", "QR Code made based on given URL.");
              for(var x=0;x<1;x++){
                URLs[arrayIndex] = {"url": textHolder, "key": keyIndex.toString(), "name": textHolder2};
                arrayIndex++;
              }
              keyIndex++;
              console.log(URLs);
              storeData();
            }
          } }
        />
        <Button
        title="Back To List"
        color="dodgerblue"
        onPress={() => {
          navigation.navigate('List');
          textHolder = "";
          textHolder2 = "";
        }}
        />
      </SafeAreaView>
    </SafeAreaView>
  );
}

const Stack = createStackNavigator();

export default function App() {
  let [fontsLoaded] = useFonts({
    'Outfit': require('./assets/fonts/Outfit-Black.ttf'),
  });

  if(!fontsLoaded) {
    return <AppLoading/>;
  }
  else{
    return(
      <NavigationContainer>
        <Stack.Navigator initialRoutename={"Home"}>
          <Stack.Screen name="Home" component={mainScreen} options={{ headerShown: false}} />
          <Stack.Screen name="List" component={listQR} options={{ headerShown: false}} />
          <Stack.Screen name="Data" component={dataInput} options={{ headerShown: false}} />
        </Stack.Navigator>
      </NavigationContainer>
    );  
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'dodgerblue',
    alignItems: 'center',
  },

  input: {
    height: 40,
    width: 200,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    backgroundColor: 'white',
    color: 'black',
  },
  
  input2: {
    height: 50,
    width: 400,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    backgroundColor: 'white',
    color: 'black',
  },
  
  container2: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
  },
});