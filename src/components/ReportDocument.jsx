import React from "react";
import {
  Page,
  Text,
  View,
  Image,
  Document,
  StyleSheet,
  Svg,
} from "@react-pdf/renderer";
import YDA from "/img/ydao.png";

const ReportDocument = () => {
  const Header = () => (
    <View style={styles.titleContainer}>
      <View style={styles.spaceBetween}>
        <Image style={styles.logo} src={YDA} />
        <Text style={styles.reportTitle}>YDA Report</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
      </View>
    </View>
  );

  const Section = ({ image, text }) => (
    <View style={styles.sectionContainer}>
      <Image style={styles.chartImage} src={image} />
      <Text style={styles.sectionText}>{text}</Text>
    </View>
  );

  const Footer = () => (
    <View style={styles.footer}>
      <Text>Footer Content Here</Text>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header />
        <Text style={styles.breakLine} />
        <Footer />
      </Page>
    </Document>
  );
};

export default ReportDocument;

const styles = StyleSheet.create({
  page: {
    fontSize: 11,
    paddingTop: 20,
    paddingLeft: 40,
    paddingRight: 40,
    lineHeight: 1.5,
    flexDirection: "column",
  },
  spaceBetween: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    color: "#3E3E3E",
  },
  titleContainer: { flexDirection: "row", marginVertical: 24 },
  logo: { width: 70 },
  reportTitle: { fontSize: 16, textAlign: "center" },
  reportDate: { fontSize: 12 },
  sectionContainer: { marginTop: 20, flexDirection: "row" },
  sectionImage: { width: 200, height: 300, marginRight: 20 },
  sectionText: { flex: 1, fontSize: 12, marginLeft: 30 },
  footer: { marginTop: 20 },
  breakLine: {
    marginVertical: 10,
    borderBottom: 1,
    borderBottomColor: "black",
  },
  chartImage: {
    backgroundColor: "#379cf0",
    width: 200,
    height: 150,
  },
});
