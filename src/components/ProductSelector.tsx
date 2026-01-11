import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {ProductType} from '../types';
import {PRODUCTS} from '../constants';

interface ProductSelectorProps {
  onSelect: (product: ProductType) => void;
  selectedId: string | undefined;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  onSelect,
  selectedId,
}) => {
  return (
    <View style={styles.container}>
      {PRODUCTS.map(product => (
        <TouchableOpacity
          key={product.id}
          style={[
            styles.productButton,
            selectedId === product.id && styles.productButtonSelected,
          ]}
          onPress={() => onSelect(product)}
          activeOpacity={0.7}>
          <Text style={styles.productIcon}>{product.icon}</Text>
          <Text
            style={[
              styles.productName,
              selectedId === product.id && styles.productNameSelected,
            ]}>
            {product.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    justifyContent: 'space-between',
  },
  productButton: {
    width: '48%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#475569',
    backgroundColor: '#1e293b',
    marginBottom: 8,
  },
  productButtonSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#60a5fa',
    shadowColor: '#2563eb',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  productIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
  productNameSelected: {
    color: '#ffffff',
  },
});

export default ProductSelector;

